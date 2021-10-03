import { AuditLogEvent } from 'discord-api-types/v9';
import { Client, Constants, GuildMember, User } from 'discord.js';
import type { Redis } from 'ioredis';
import { on } from 'node:events';
import { setTimeout as pSetTimeout } from 'node:timers/promises';
import { inject, injectable } from 'tsyringe';

import type { Event } from '../../Event';
import { createCase, CaseAction } from '../../functions/cases/createCase';
import { generateCasePayload } from '../../functions/logs/generateCasePayload';
import { upsertCaseLog } from '../../functions/logs/upsertCaseLog';
import { checkLogChannel } from '../../functions/settings/checkLogChannel';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting';
import { logger } from '../../logger';
import { kRedis } from '../../tokens';

@injectable()
export default class implements Event {
	public name = 'Manual kick handling';

	public event = Constants.Events.GUILD_MEMBER_REMOVE;

	public disabled = true;

	public constructor(public readonly client: Client<true>, @inject(kRedis) public readonly redis: Redis) {}

	public async execute(): Promise<void> {
		for await (const [guildMember] of on(this.client, this.event) as AsyncIterableIterator<[GuildMember]>) {
			try {
				logger.info(
					{ event: { name: this.name, event: this.event }, guildId: guildMember.guild.id, memberId: guildMember.id },
					`Member ${guildMember.id} kicked`,
				);

				const logChannel = await checkLogChannel(
					guildMember.guild,
					await getGuildSetting(guildMember.guild.id, SettingsKeys.ModLogChannelId),
				);
				if (!logChannel) {
					continue;
				}

				const deleted = await this.redis.del(`guild:${guildMember.guild.id}:user:${guildMember.user.id}:kick`);
				if (deleted) {
					continue;
				}
				await pSetTimeout(1500);
				const auditLogs = await guildMember.guild.fetchAuditLogs({ limit: 10, type: AuditLogEvent.MemberKick });
				const logs = auditLogs.entries.find((log) => (log.target as User).id === guildMember.user.id);

				if (logs) {
					const case_ = await createCase(
						guildMember.guild,
						generateCasePayload({
							guildId: guildMember.guild.id,
							user: logs.executor,
							args: { user: { user: guildMember.user }, reason: logs.reason },
							action: CaseAction.Kick,
						}),
						true,
					);
					await upsertCaseLog(guildMember.guild.id, logs.executor, case_);
				}
			} catch (e) {
				const error = e as Error;
				logger.error(error, error.message);
			}

			continue;
		}
	}
}

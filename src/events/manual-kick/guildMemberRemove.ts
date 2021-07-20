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

	public constructor(public readonly client: Client, @inject(kRedis) public readonly redis: Redis) {}

	public async execute(): Promise<void> {
		for await (const [guildMember] of on(this.client, this.event) as AsyncIterableIterator<[GuildMember]>) {
			try {
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
				await pSetTimeout(1000);
				const auditLogs = await guildMember.guild.fetchAuditLogs({ limit: 5, type: 20 });
				const logs = auditLogs.entries.find((log) => (log.target as User).id === guildMember.user.id);

				if (logs) {
					const case_ = await createCase(
						guildMember.guild,
						generateCasePayload({
							guildId: guildMember.guild.id,
							user: logs.executor!,
							args: { user: { user: guildMember.user }, reason: logs.reason },
							action: CaseAction.Kick,
						}),
						true,
					);
					await upsertCaseLog(guildMember.guild, logs.executor!, logChannel, case_);
				}
			} catch (e) {
				logger.error(e);
			}

			continue;
		}
	}
}

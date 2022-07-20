import { on } from 'node:events';
import { setTimeout as pSetTimeout } from 'node:timers/promises';
import { AuditLogEvent } from 'discord-api-types/v10';
import { Client, Events, type GuildMember } from 'discord.js';
import type { Redis } from 'ioredis';
import { inject, injectable } from 'tsyringe';
import type { Event } from '../../Event.js';
import { CaseAction } from '../../functions/cases/createCase.js';
import { checkLogChannel } from '../../functions/settings/checkLogChannel.js';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting.js';
import { logger } from '../../logger.js';
import ModAction from '../../structures/ModAction.js';
import { kRedis } from '../../tokens.js';

@injectable()
export default class implements Event {
	public name = 'Manual kick handling';

	public event = Events.GuildMemberRemove;

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
					(await getGuildSetting(guildMember.guild.id, SettingsKeys.ModLogChannelId)) as string,
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
				const logs = auditLogs.entries.find((log) => log.target!.id === guildMember.user.id);

				if (logs) {
					await new ModAction(guildMember.guild, {
						user: logs.executor,
						args: { user: { user: guildMember.user }, reason: logs.reason },
						action: CaseAction.Kick,
					}).takeAction(true);
				}
			} catch (e) {
				const error = e as Error;
				logger.error(error, error.message);
			}

			continue;
		}
	}
}

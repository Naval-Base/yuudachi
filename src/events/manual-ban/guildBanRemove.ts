import { AuditLogEvent } from 'discord-api-types/v9';
import { Client, Constants, GuildBan, User } from 'discord.js';
import type { Redis } from 'ioredis';
import { on } from 'node:events';
import { setTimeout as pSetTimeout } from 'node:timers/promises';
import { inject, injectable } from 'tsyringe';

import type { Event } from '../../Event';
import { deleteCase } from '../../functions/cases/deleteCase';
import { upsertCaseLog } from '../../functions/logs/upsertCaseLog';
import { checkLogChannel } from '../../functions/settings/checkLogChannel';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting';
import { logger } from '../../logger';
import { kRedis } from '../../tokens';

@injectable()
export default class implements Event {
	public name = 'Manual unban handling';

	public event = Constants.Events.GUILD_BAN_REMOVE;

	public constructor(public readonly client: Client<true>, @inject(kRedis) public readonly redis: Redis) {}

	public async execute(): Promise<void> {
		for await (const [guildBan] of on(this.client, this.event) as AsyncIterableIterator<[GuildBan]>) {
			try {
				const logChannel = await checkLogChannel(
					guildBan.guild,
					await getGuildSetting(guildBan.guild.id, SettingsKeys.ModLogChannelId),
				);
				if (!logChannel) {
					continue;
				}

				const deleted = await this.redis.del(`guild:${guildBan.guild.id}:user:${guildBan.user.id}:unban`);
				if (deleted) {
					continue;
				}
				await pSetTimeout(750);
				const auditLogs = await guildBan.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberBanRemove });
				const logs = auditLogs.entries.find((log) => (log.target as User).id === guildBan.user.id);

				if (logs) {
					const case_ = await deleteCase({
						guild: guildBan.guild,
						user: logs.executor!,
						target: guildBan.user,
						manual: true,
						skipAction: true,
					});
					await upsertCaseLog(guildBan.guild.id, logs.executor!, case_);
				}
			} catch (e) {
				logger.error(e, e.message);
			}

			continue;
		}
	}
}

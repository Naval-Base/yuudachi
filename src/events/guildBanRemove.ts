import { Client, Constants, GuildBan, User } from 'discord.js';
import i18next from 'i18next';
import type { Redis } from 'ioredis';
import { on } from 'node:events';
import { setTimeout as pSetTimeout } from 'node:timers/promises';
import { inject, injectable } from 'tsyringe';

import type { Event } from '../Event';
import { deleteCase } from '../functions/cases/deleteCase';
import { upsertCaseLog } from '../functions/logs/upsertCaseLog';
import { checkModLogChannel } from '../functions/settings/checkModLogChannel';
import { getGuildSetting, SettingsKeys } from '../functions/settings/getGuildSetting';
import { logger } from '../logger';
import { kRedis } from '../tokens';

@injectable()
export default class implements Event {
	public name = Constants.Events.GUILD_BAN_REMOVE;

	public constructor(public readonly client: Client, @inject(kRedis) public readonly redis: Redis) {}

	public async execute(): Promise<void> {
		for await (const [guildBan] of on(this.client, this.name) as AsyncIterableIterator<[GuildBan]>) {
			try {
				const logChannel = await checkModLogChannel(
					guildBan.guild,
					await getGuildSetting(guildBan.guild.id, SettingsKeys.ModLogChannelId),
				);
				if (!logChannel) {
					throw new Error(i18next.t('common.errors.no_mod_log_channel'));
				}

				const deleted = await this.redis.del(`guild:${guildBan.guild.id}:user:${guildBan.user.id}:unban`);
				if (deleted) {
					continue;
				}
				await pSetTimeout(1000);
				const auditLogs = await guildBan.guild.fetchAuditLogs({ limit: 5, type: 23 });
				const logs = auditLogs.entries.find((log) => (log.target as User).id === guildBan.user.id);

				if (logs) {
					const case_ = await deleteCase({
						guild: guildBan.guild,
						user: logs.executor!,
						target: guildBan.user,
						manual: true,
						skipAction: true,
					});
					await upsertCaseLog(guildBan.guild, logs.executor!, logChannel, case_);
				}
			} catch (e) {
				logger.error(e);
			}

			continue;
		}
	}
}

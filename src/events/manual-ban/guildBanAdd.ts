import { AuditLogEvent } from 'discord-api-types/v9';
import { Client, Constants, GuildBan, User } from 'discord.js';
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
	public name = 'Manual ban handling';

	public event = Constants.Events.GUILD_BAN_ADD;

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

				const deleted = await this.redis.del(`guild:${guildBan.guild.id}:user:${guildBan.user.id}:ban`);
				const antiRaidNuke = await this.redis.get(`guild:${guildBan.guild.id}:anti_raid_nuke`);
				if (deleted || antiRaidNuke) {
					logger.info(
						{
							event: { name: this.name, event: this.event },
							guildId: guildBan.guild.id,
							memberId: guildBan.user.id,
							manual: false,
							antiRaidNuke: Boolean(antiRaidNuke),
						},
						`Member ${guildBan.user.id} banned`,
					);

					continue;
				}

				await pSetTimeout(1500);
				const auditLogs = await guildBan.guild.fetchAuditLogs({ limit: 10, type: AuditLogEvent.MemberBanAdd });
				const logs = auditLogs.entries.find((log) => (log.target as User).id === guildBan.user.id);

				logger.info(
					{
						event: { name: this.name, event: this.event },
						guildId: guildBan.guild.id,
						userId: logs?.executor?.id,
						memberId: guildBan.user.id,
						manual: true,
					},
					`Member ${guildBan.user.id} banned`,
				);
				logger.info(
					{
						event: { name: this.name, event: this.event },
						guildId: guildBan.guild.id,
						userId: logs?.executor?.id,
						memberId: guildBan.user.id,
						manual: true,
						logs,
					},
					`Fetched logs for ban ${guildBan.user.id}`,
				);

				const case_ = await createCase(
					guildBan.guild,
					generateCasePayload({
						guildId: guildBan.guild.id,
						user: logs?.executor,
						args: { user: { user: guildBan.user }, reason: logs?.reason },
						action: CaseAction.Ban,
					}),
					true,
				);
				await upsertCaseLog(guildBan.guild.id, logs?.executor, case_);
			} catch (e) {
				logger.error(e, e.message);
			}

			continue;
		}
	}
}

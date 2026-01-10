import { on } from "node:events";
import { setTimeout as pSetTimeout } from "node:timers/promises";
import { inject, injectable } from "@needle-di/core";
import { logger, kRedis } from "@yuudachi/framework";
import type { Event } from "@yuudachi/framework/types";
import { Client, Events, type GuildBan, AuditLogEvent } from "discord.js";
import type { Redis } from "ioredis";
import { AUDIT_LOG_WAIT_SECONDS } from "../../Constants.js";
import { deleteCase } from "../../functions/cases/deleteCase.js";
import { upsertCaseLog } from "../../functions/logging/upsertCaseLog.js";
import { checkLogChannel } from "../../functions/settings/checkLogChannel.js";
import { getGuildSetting, SettingsKeys } from "../../functions/settings/getGuildSetting.js";

@injectable()
export default class implements Event {
	public name = "Manual unban handling";

	public event = Events.GuildBanRemove as const;

	public constructor(
		public readonly client: Client<true> = inject(Client),
		public readonly redis: Redis = inject(kRedis),
	) {}

	public async execute(): Promise<void> {
		for await (const [guildBan] of on(this.client, this.event) as AsyncIterableIterator<[GuildBan]>) {
			try {
				const modLogChannel = checkLogChannel(
					guildBan.guild,
					await getGuildSetting(guildBan.guild.id, SettingsKeys.ModLogChannelId),
				);

				if (!modLogChannel) {
					continue;
				}

				const deleted = await this.redis.del(`guild:${guildBan.guild.id}:user:${guildBan.user.id}:unban`);

				if (deleted) {
					logger.info(
						{
							event: { name: this.name, event: this.event },
							guildId: guildBan.guild.id,
							memberId: guildBan.user.id,
							manual: false,
						},
						`Member ${guildBan.user.id} unbanned`,
					);
					continue;
				}

				logger.info(
					{
						event: { name: this.name, event: this.event },
						guildId: guildBan.guild.id,
						memberId: guildBan.user.id,
						manual: true,
					},
					`Member ${guildBan.user.id} unbanned`,
				);

				await pSetTimeout(AUDIT_LOG_WAIT_SECONDS * 1_000);
				const auditLogs = await guildBan.guild.fetchAuditLogs({ limit: 10, type: AuditLogEvent.MemberBanRemove });
				const logs = auditLogs.entries.find((log) => log.target!.id === guildBan.user.id);
				logger.info(
					{
						event: { name: this.name, event: this.event },
						guildId: guildBan.guild.id,
						memberId: guildBan.user.id,
						manual: true,
						logs,
					},
					`Fetched logs for unban ${guildBan.user.id}`,
				);

				const case_ = await deleteCase({
					guild: guildBan.guild,
					user: logs?.executor,
					target: guildBan.user,
					manual: true,
					skipAction: true,
					reason: logs?.reason,
				});
				await upsertCaseLog(guildBan.guild, logs?.executor, case_);
			} catch (error) {
				const error_ = error as Error;
				logger.error(error_, error_.message);
			}
		}
	}
}

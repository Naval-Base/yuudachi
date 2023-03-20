import { on } from "node:events";
import { setTimeout as pSetTimeout } from "node:timers/promises";
import { logger, kRedis } from "@yuudachi/framework";
import type { Event } from "@yuudachi/framework/types";
import { Client, Events, type GuildMember, AuditLogEvent } from "discord.js";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { Redis } from "ioredis";
import { inject, injectable } from "tsyringe";
import { AUDIT_LOG_WAIT_SECONDS } from "../../Constants.js";
import { createCase, CaseAction } from "../../functions/cases/createCase.js";
import { generateCasePayload } from "../../functions/logging/generateCasePayload.js";
import { upsertCaseLog } from "../../functions/logging/upsertCaseLog.js";
import { checkLogChannel } from "../../functions/settings/checkLogChannel.js";
import { getGuildSetting, SettingsKeys } from "../../functions/settings/getGuildSetting.js";

@injectable()
export default class implements Event {
	public name = "Manual kick handling";

	public event = Events.GuildMemberRemove as const;

	public disabled = true;

	public constructor(
		public readonly client: Client<true>,
		// @ts-expect-error: Needs tsyringe update
		@inject(kRedis) public readonly redis: Redis,
	) {}

	public async execute(): Promise<void> {
		for await (const [guildMember] of on(this.client, this.event) as AsyncIterableIterator<[GuildMember]>) {
			try {
				logger.info(
					{ event: { name: this.name, event: this.event }, guildId: guildMember.guild.id, memberId: guildMember.id },
					`Member ${guildMember.id} kicked`,
				);

				const modLogChannel = checkLogChannel(
					guildMember.guild,
					await getGuildSetting(guildMember.guild.id, SettingsKeys.ModLogChannelId),
				);

				if (!modLogChannel) {
					continue;
				}

				const deleted = await this.redis.del(`guild:${guildMember.guild.id}:user:${guildMember.user.id}:kick`);

				if (deleted) {
					continue;
				}

				await pSetTimeout(AUDIT_LOG_WAIT_SECONDS * 1_000);
				const auditLogs = await guildMember.guild.fetchAuditLogs({ limit: 10, type: AuditLogEvent.MemberKick });
				const logs = auditLogs.entries.find((log) => log.target!.id === guildMember.user.id);

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
					await upsertCaseLog(guildMember.guild, logs.executor, case_);
				}
			} catch (error_) {
				const error = error_ as Error;
				logger.error(error, error.message);
			}
		}
	}
}

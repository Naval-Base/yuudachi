import { on } from "node:events";
import { logger, kRedis } from "@yuudachi/framework";
import type { Event } from "@yuudachi/framework/types";
import type { AutoModerationActionExecution } from "discord.js";
import { AutoModerationRuleTriggerType, AutoModerationActionType, Client, Events } from "discord.js";
import i18next from "i18next";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { Redis } from "ioredis";
import { inject, injectable } from "tsyringe";
import { CaseAction, createCase } from "../../functions/cases/createCase.js";
import { generateCasePayload } from "../../functions/logging/generateCasePayload.js";
import { upsertCaseLog } from "../../functions/logging/upsertCaseLog.js";
import { getGuildSetting, SettingsKeys } from "../../functions/settings/getGuildSetting.js";

@injectable()
export default class implements Event {
	public name = "AutoMod timeout handler";

	public event = Events.AutoModerationActionExecution as const;

	public constructor(public readonly client: Client<true>, @inject(kRedis) public readonly redis: Redis) {}

	public async execute(): Promise<void> {
		for await (const [autoModAction] of on(this.client, this.event) as AsyncIterableIterator<
			[AutoModerationActionExecution]
		>) {
			try {
				if (autoModAction.action.type !== AutoModerationActionType.Timeout) {
					continue;
				}

				const guild = this.client.guilds.resolve(autoModAction.guild.id);

				if (!guild) {
					continue;
				}

				const member = await guild.members.fetch(autoModAction.userId);

				await this.redis.setex(`guild:${autoModAction.guild.id}:user:${autoModAction.userId}:auto_mod_timeout`, 15, "");

				const locale = await getGuildSetting(autoModAction.guild.id, SettingsKeys.Locale);

				logger.info(
					{
						event: { name: this.name, event: this.event },
						guildId: autoModAction.guild.id,
						memberId: autoModAction.userId,
						manual: false,
					},
					`Member ${autoModAction.userId} timed out (AutoMod)`,
				);

				let reasonType = "default";
				switch (autoModAction.ruleTriggerType) {
					case AutoModerationRuleTriggerType.Keyword:
						reasonType = "keyword";
						break;
					case AutoModerationRuleTriggerType.KeywordPreset:
						reasonType = "keyword_preset";
						break;
					case AutoModerationRuleTriggerType.Spam:
						reasonType = "spam";
						break;
					default:
						break;
				}

				const reason = i18next.t(`log.mod_log.auto_mod.${reasonType}`, { lng: locale });

				const case_ = await createCase(
					member.guild,
					generateCasePayload({
						guildId: autoModAction.guild.id,
						user: this.client.user,
						args: { user: { user: member.user }, reason },
						action: CaseAction.Timeout,
						duration: autoModAction.action.metadata.durationSeconds
							? autoModAction.action.metadata.durationSeconds * 1_000
							: null,
					}),
					true,
				);

				await upsertCaseLog(guild, this.client.user, case_);
			} catch (error_) {
				const error = error_ as Error;
				logger.error(error, error.message);
			}
		}
	}
}

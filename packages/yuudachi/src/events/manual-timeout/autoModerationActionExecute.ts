import { on } from 'node:events';
import { Client, Events } from 'discord.js';
import i18next from 'i18next';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { Redis } from 'ioredis';
import { inject, injectable } from 'tsyringe';
import type { Event } from '../../Event.js';
import { CaseAction, createCase } from '../../functions/cases/createCase.js';
import { generateCasePayload } from '../../functions/logging/generateCasePayload.js';
import { upsertCaseLog } from '../../functions/logging/upsertCaseLog.js';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting.js';
import { logger } from '../../logger.js';
import { kRedis } from '../../tokens.js';
import {
	APIAutoModerationRuleActionType,
	APIAutoModerationRuleTriggerType,
	type GatewayAutoModerationActionExecution,
} from '../../util/tempAutomodTypes.js';

@injectable()
export default class implements Event {
	public name = 'AutoMod timeout handler';

	public event = Events.Raw as const;

	public constructor(public readonly client: Client<true>, @inject(kRedis) public readonly redis: Redis) {}

	public async execute(): Promise<void> {
		for await (const [rawData] of on(this.client, this.event) as AsyncIterableIterator<
			[
				{
					d: GatewayAutoModerationActionExecution;
					op: number;
					t: string;
				},
			]
		>) {
			try {
				if (rawData.t !== 'AUTO_MODERATION_ACTION_EXECUTION') {
					continue;
				}

				const autoModAction = rawData.d;

				if (autoModAction.action.type !== APIAutoModerationRuleActionType.Timeout) {
					continue;
				}

				const guild = this.client.guilds.resolve(autoModAction.guild_id);

				if (!guild) {
					continue;
				}

				const member = await guild.members.fetch(autoModAction.user_id);

				await this.redis.setex(
					`guild:${autoModAction.guild_id}:user:${autoModAction.user_id}:auto_mod_timeout`,
					15,
					'',
				);

				const locale = await getGuildSetting(autoModAction.guild_id, SettingsKeys.Locale);

				logger.info(
					{
						event: { name: this.name, event: this.event },
						guildId: autoModAction.guild_id,
						memberId: autoModAction.user_id,
						manual: false,
					},
					`Member ${autoModAction.user_id} timed out (AutoMod)`,
				);

				let reasonType = 'default';
				switch (autoModAction.rule_trigger_type) {
					case APIAutoModerationRuleTriggerType.HarmfulLink:
						reasonType = 'harmful_link';
						break;
					case APIAutoModerationRuleTriggerType.Keyword:
						reasonType = 'keyword';
						break;
					case APIAutoModerationRuleTriggerType.KeywordPreset:
						reasonType = 'keyword_preset';
						break;
					case APIAutoModerationRuleTriggerType.Spam:
						reasonType = 'spam';
						break;
					default:
						break;
				}

				const reason = i18next.t(`log.mod_log.auto_mod.${reasonType}`, { lng: locale });

				const case_ = await createCase(
					member.guild,
					generateCasePayload({
						guildId: autoModAction.guild_id,
						user: this.client.user,
						args: { user: { user: member.user }, reason },
						action: CaseAction.Timeout,
						duration: autoModAction.action.metadata.duration_seconds * 1_000,
					}),
					true,
				);

				await upsertCaseLog(guild, this.client.user, case_);
			} catch (error_) {
				const error = error_ as Error;
				logger.error(error, error.message);
			}

			continue;
		}
	}
}

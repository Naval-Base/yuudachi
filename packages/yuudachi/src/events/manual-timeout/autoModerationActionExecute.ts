import { on } from 'events';
import { Client, Events } from 'discord.js';
import i18next from 'i18next';
import type { default as Redis } from 'ioredis';
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

	public constructor(
		public readonly client: Client<true>,
		@inject(kRedis) public readonly redis: Redis,
	) {}

	public async execute(): Promise<void> {
		for await (const [rawData] of on(this.client, this.event) as AsyncIterableIterator<
			[
				{
					op: number;
					t: string;
					d: GatewayAutoModerationActionExecution;
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
				const member = await guild.members.fetch(autoModAction.user_id);

				await this.redis.setex(`guild:${member.guild.id}:user:${member.id}:auto_mod_timeout`, 15, '');

				const locale = await getGuildSetting(guild.id, SettingsKeys.Locale);

				logger.info(
					{
						event: { name: this.name, event: this.event },
						guildId: member.guild.id,
						memberId: member.id,
						manual: false,
					},
					`Member ${member.id} timed out (AutoMod)`,
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
						guildId: member.guild.id,
						user: this.client.user,
						args: { user: { user: member.user }, reason },
						action: CaseAction.Timeout,
						duration: autoModAction.action.metadata.duration_seconds * 1000,
					}),
					true,
				);

				await upsertCaseLog(guild, this.client.user, case_);
			} catch (e) {
				const error = e as Error;
				logger.error(error, error.message);
			}

			continue;
		}
	}
}

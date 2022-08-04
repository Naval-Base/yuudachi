import { on } from 'events';
import { Client, Events } from 'discord.js';
import i18next from 'i18next';
import type { Redis } from 'ioredis';
import { inject, injectable } from 'tsyringe';
import { DISCORD_ACCOUNT_USER_ID } from '../../Constants.js';
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
	GatewayAutoModerationActionExecution,
} from '../../util/tempAutomodTypes.js';

@injectable()
export default class implements Event {
	public name = 'Auto-mod timeout handler';

	public event = Events.Raw as const;

	public constructor(
		@inject(Client) public readonly client: Client<true>,
		@inject(kRedis) public readonly redis: Redis,
	) {}

	public async execute(): Promise<void> {
		for await (const [rawData] of on(this.client, this.event) as AsyncIterableIterator<
			[
				{
					op: number;
					t: string;
					d: any;
				},
			]
		>) {
			try {
				if (rawData.t !== 'AUTO_MODERATION_ACTION_EXECUTION') {
					continue;
				}

				const automodAction = rawData.d as GatewayAutoModerationActionExecution;

				if (automodAction.action.type !== APIAutoModerationRuleActionType.Timeout) {
					continue;
				}

				const guild = await this.client.guilds.fetch(automodAction.guild_id);
				const member = await guild.members.fetch(automodAction.user_id);

				await this.redis.setex(`guild:${member.guild.id}:user:${member.id}:automod_timeout`, 15, '');

				const locale = await getGuildSetting(guild.id, SettingsKeys.Locale);

				const discord = await this.client.users.fetch(DISCORD_ACCOUNT_USER_ID);

				logger.info(
					{
						event: { name: this.name, event: this.event },
						guildId: member.guild.id,
						memberId: member.id,
						manual: false,
					},
					`Member ${member.id} timed out (AutoMod)`,
				);

				let reasonType: string | null;
				switch (automodAction.rule_trigger_type) {
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
						reasonType = 'default';
				}

				const reason = i18next.t(`log.mod_log.auto_mod.${reasonType}`, { lng: locale });

				const case_ = await createCase(
					member.guild,
					generateCasePayload({
						guildId: member.guild.id,
						user: discord,
						args: { user: { user: member.user }, reason },
						action: CaseAction.Timeout,
						duration: automodAction.action.metadata.duration_seconds * 1000,
					}),
					true,
				);

				await upsertCaseLog(guild, discord, case_);
			} catch (e) {
				const error = e as Error;
				logger.error(error, error.message);
			}

			continue;
		}
	}
}

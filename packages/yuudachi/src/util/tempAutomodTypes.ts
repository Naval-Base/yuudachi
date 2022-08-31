import type { Snowflake } from 'discord.js';

// https://github.com/discordjs/discord-api-types/pull/497

/**
 * https://discord.com/developers/docs/topics/gateway#auto-moderation-action-execution-auto-moderation-action-execution-event-fields
 */
export type GatewayAutoModerationActionExecution = {
	/**
	 * The action which was executed
	 */
	action: APIAutoModerationRuleAction;

	/**
	 * The id of any system auto moderation messages posted as a result of this action
	 *
	 * Will not exist if this event does not correspond to an action with type `SendAlertMessage`
	 */
	alert_system_message_id?: Snowflake;

	/**
	 * The id of the channel in which user content was posted
	 */
	channel_id?: Snowflake;

	/**
	 * The user generated text content
	 */
	content: string;

	/**
	 * The id of the guild in which action was executed
	 */
	guild_id: Snowflake;

	/**
	 * The substring in content that triggered the rule
	 */
	matched_content: string;

	/**
	 * The word or phrase configured in the rule that triggered the rule
	 */
	matched_keyword: string;

	/**
	 * The id of any user message which content belongs to
	 *
	 * Will not exist if message was blocked by automod or content was not part of any message
	 */
	message_id?: Snowflake;

	/**
	 * The id of the rule which action belongs to
	 */
	rule_id: Snowflake;

	/**
	 * The trigger type of rule which was triggered
	 */
	rule_trigger_type: APIAutoModerationRuleTriggerType;

	/**
	 * The id of the user which generated the content which triggered the rule
	 */
	user_id: Snowflake;
};

/**
 * https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-auto-moderation-rule-structure
 */
export type APIAutoModerationRule = {
	/**
	 * The actions which will execute when the rule is triggered
	 */
	actions: APIAutoModerationRuleAction[];

	/**
	 * The user which first created this rule
	 */
	creator_id: Snowflake;

	/**
	 * Whether the rule is enabled
	 */
	enabled: boolean;

	/**
	 * The rule event type
	 */
	event_type: APIAutoModerationRuleEventType;

	/**
	 * The channel ids that should not be affected by the rule
	 *
	 * Maxiumum of `50`
	 */
	exempt_channels: Snowflake[];

	/**
	 * The role ids that should not be affected by the rule
	 *
	 * Maxiumum of `20`
	 */
	exempt_roles: Snowflake[];

	/**
	 * The guild which this rule belongs to
	 */
	guild_id: Snowflake;

	/**
	 * The id of this rule
	 */
	id: Snowflake;

	/**
	 * The rule name
	 */
	name: string;

	/**
	 * The rule trigger metadata
	 */
	trigger_metadata: APIAutoModerationRuleTriggerMetadata;

	/**
	 * The rule trigger type
	 */
	trigger_type: APIAutoModerationRuleTriggerType;
};

export enum APIAutoModerationRuleEventType {
	/**
	 * When a member sends or edits a message in the guild
	 */
	MessageSend = 1,
}

export type APIAutoModerationRuleAction = {
	/**
	 * The metadata for the action
	 */
	metadata: APIAutoModerationRuleActionMetadata;

	/**
	 * The type of action
	 */
	type: APIAutoModerationRuleActionType;
};
/**
 * https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-action-object-action-types
 */
export enum APIAutoModerationRuleActionType {
	/**
	 * Blocks the content of a message according to the rule
	 */
	BlockMessage = 1,

	/**
	 * Logs user content to a specified channel
	 */
	SendAlertMessage,

	/**
	 * Timeout user for a specified duration
	 *
	 * Can only be used by `Keywords` rules
	 */
	Timeout,
}

/**
 * https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-action-object-action-metadata
 */
export enum APIAutoModerationRuleTriggerType {
	/**
	 * Check if content contains words from a user defined list of keywords
	 *
	 * Maximum of `3` per guild
	 */
	Keyword = 1,

	/**
	 * Check if content contains any harmful links
	 *
	 * Maximum of `1` per guild
	 */
	HarmfulLink,

	/**
	 * Check if content represents generic spam
	 *
	 * Maximum of `1` per guild
	 */
	Spam,

	/**
	 * Check if content contains words from internal pre-defined wordsets
	 *
	 * Maximum of `1` per guild
	 */
	KeywordPreset,
}

/**
 * https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-trigger-metadata
 */
export type APIAutoModerationRuleTriggerMetadata = {
	keyword_filter: string[];

	presets: APIAutoModerationRuleKeywordPresetTypes[];
};

/**
 * https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-keyword-preset-types
 */
export enum APIAutoModerationRuleKeywordPresetTypes {
	/**
	 * Words that may be considered forms of swearing or cursing
	 */
	Profanity = 1,

	/**
	 * Words that refer to sexually explicit behavior or activity
	 */
	SexualContent,

	/**
	 * Personal insults or words that may be considered hate speech
	 */
	Slurs,
}

/**
 * https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-action-object-action-metadata
 */
export type APIAutoModerationRuleActionMetadata = {
	/**
	 * Channel to which user content should be logged
	 */
	channel_id: string;

	/**
	 * Timeout duration in seconds
	 *
	 * Maximum of 4 weeks (2419200 seconds)
	 */
	duration_seconds: number;
};

import type { Snowflake } from "discord.js";
import type { Sql } from "postgres";
import { container } from "tsyringe";
import { kSQL } from "../../tokens.js";

export enum SettingsKeys {
	AntiRaidNukeArchiveChannelId = "anti_raid_nuke_archive_channel_id",
	AutomodIgnoreRoles = "automod_ignore_roles",
	EmbedRoleId = "embed_role_id",
	EmojiRoleId = "emoji_role_id",
	ForceLocale = "force_locale",
	GuildLogWebhookId = "guild_log_webhook_id",
	Locale = "locale",
	LogIgnoreChannels = "log_ignore_channels",
	MemberLogWebhookId = "member_log_webhook_id",
	ModLogChannelId = "mod_log_channel_id",
	ModRoleId = "mod_role_id",
	ReactionRoleId = "reaction_role_id",
	ReportChannelId = "report_channel_id",
	SponsorRoleId = "sponsor_role_id",
}

export async function getGuildSetting<T = string>(guildId: Snowflake, prop: SettingsKeys, table = "guild_settings") {
	const sql = container.resolve<Sql<{}>>(kSQL);

	const [data] = await sql.unsafe<[{ value: boolean | string | null }?]>(
		`select ${prop} as value
		from ${table}
		where guild_id = $1`,
		[guildId],
	);

	return (data?.value ?? null) as unknown as T;
}

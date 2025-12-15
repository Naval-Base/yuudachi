import { kSQL, container } from "@yuudachi/framework";
import type { Snowflake } from "discord.js";
import type { Sql } from "postgres";

export enum SettingsKeys {
	AntiRaidNukeArchiveChannelId = "anti_raid_nuke_archive_channel_id",
	AutomodIgnoreRoles = "automod_ignore_roles",
	ForceLocale = "force_locale",
	GuildLogWebhookId = "guild_log_webhook_id",
	Locale = "locale",
	LogIgnoreChannels = "log_ignore_channels",
	MemberLogWebhookId = "member_log_webhook_id",
	ModLogChannelId = "mod_log_channel_id",
	ModRoleId = "mod_role_id",
	ReportChannelId = "report_channel_id",
	ReportStatusTags = "report_status_tags",
	ReportTypeTags = "report_type_tags",
	SponsorRoleId = "sponsor_role_id",
}

export type ReportStatusTagTuple = [string, string, string, string, string, string];
export type ReportTypeTagTuple = [string, string];

export async function getGuildSetting<T = string>(guildId: Snowflake, prop: SettingsKeys, table = "guild_settings") {
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	const sql = container.get<Sql<{}>>(kSQL);

	const [data] = await sql.unsafe<[{ value: ReportStatusTagTuple | ReportTypeTagTuple | boolean | string | null }?]>(
		`select ${prop} as value
		from ${table}
		where guild_id = $1`,
		[guildId],
	);

	return (data?.value ?? null) as unknown as T;
}

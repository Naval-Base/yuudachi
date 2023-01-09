import type { Guild, Snowflake, TextChannel, ForumChannel } from "discord.js";

export function checkLogChannel(guild: Guild, logChannelId: Snowflake) {
	return guild.client.channels.resolve(logChannelId) as TextChannel | null;
}

export function checkReportForum(guild: Guild, reportForumId: Snowflake) {
	return guild.client.channels.resolve(reportForumId) as ForumChannel | null;
}

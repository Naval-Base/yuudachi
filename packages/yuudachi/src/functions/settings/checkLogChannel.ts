import type { Guild, Snowflake, TextChannel } from "discord.js";

export function checkLogChannel(guild: Guild, logChannelId: Snowflake) {
	try {
		return guild.client.channels.resolve(logChannelId) as TextChannel;
	} catch {
		return null;
	}
}

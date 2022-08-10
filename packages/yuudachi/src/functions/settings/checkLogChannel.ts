import type { Guild, Snowflake, TextChannel } from 'discord.js';

export function checkLogChannel(guild: Guild, logChannelId: Snowflake) {
	try {
		const logChannel = guild.client.channels.resolve(logChannelId) as TextChannel;

		return logChannel;
	} catch (error) {
		return null;
	}
}

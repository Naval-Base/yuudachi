import type { Guild, Snowflake, TextChannel } from 'discord.js';

export async function checkModLogChannel(guild: Guild, logChannelId: Snowflake) {
	try {
		const logChannel = (await guild.client.channels.fetch(logChannelId)) as TextChannel;
		return logChannel;
	} catch (error) {
		return null;
	}
}

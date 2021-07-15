import type { Snowflake } from 'discord.js';

export function generateMessageLink(guildId: Snowflake, channelId: Snowflake, messageId: Snowflake) {
	return `https://discord.com/channels/${guildId}/${channelId}/${messageId}`;
}

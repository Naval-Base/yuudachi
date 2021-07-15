import type { Guild, Snowflake, TextChannel } from 'discord.js';
import i18next from 'i18next';

export async function checkModLogChannel(guild: Guild, logChannelId: Snowflake, locale = 'en') {
	try {
		const logChannel = (await guild.client.channels.fetch(logChannelId)) as TextChannel;
		return logChannel;
	} catch (error) {
		throw new Error(i18next.t('common.errors.no_mod_log_channel', { lng: locale }));
	}
}

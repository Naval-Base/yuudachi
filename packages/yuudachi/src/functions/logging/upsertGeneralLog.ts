import { Client, Snowflake, TextChannel, User } from 'discord.js';
import i18next from 'i18next';
import { container } from 'tsyringe';
import { generateAntiRaidNukeReportEmbed } from './generateAntiRaidNukeReportEmbed.js';
import type { AntiRaidResult } from '../../commands/moderation/anti-raid-nuke.js';
import { checkLogChannel } from '../settings/checkLogChannel.js';
import { getGuildSetting, SettingsKeys } from '../settings/getGuildSetting.js';

export async function upsertAntiRaidNukeReport(
	guildId: Snowflake,
	user: User,
	channel: TextChannel,
	report: AntiRaidResult[],
) {
	const client = container.resolve<Client<true>>(Client);

	const guild = await client.guilds.fetch(guildId);
	const locale = await getGuildSetting(guild.id, SettingsKeys.Locale);
	const logChannel = await checkLogChannel(guild, await getGuildSetting(guild.id, SettingsKeys.AntiRaidArchive));

	if (!logChannel) {
		throw new Error(i18next.t('common.errors.no_mod_log_channel', { lng: locale }));
	}

	const embed = generateAntiRaidNukeReportEmbed(report.filter((r) => r.success).length, user, channel, locale);

	const message = await logChannel.send({
		embeds: [embed],
	});

	return message;
}

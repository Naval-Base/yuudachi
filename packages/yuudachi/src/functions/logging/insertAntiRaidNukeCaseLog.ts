import type { APIEmbed } from 'discord-api-types/v10';
import { Client, User } from 'discord.js';
import i18next from 'i18next';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';
import { generateAntiRaidNukeCaseLog } from './generateAntiRaidNukeCaseLog.js';
import { kSQL } from '../../tokens.js';
import type { Case } from '../cases/createCase.js';
import { checkLogChannel } from '../settings/checkLogChannel.js';
import { getGuildSetting, SettingsKeys } from '../settings/getGuildSetting.js';

export async function insertAntiRaidNukeCaseLog(guildId: string, user: User, cases: Case[], reason: string) {
	const client = container.resolve<Client<true>>(Client);
	const sql = container.resolve<Sql<any>>(kSQL);
	const locale = await getGuildSetting(guildId, SettingsKeys.Locale);
	const guild = await client.guilds.fetch(guildId);
	const logChannel = await checkLogChannel(guild, await getGuildSetting(guildId, SettingsKeys.ModLogChannelId));

	const [nextCase] = await sql<[{ next_case: number }]>`select next_case(${guildId});`;
	const from = nextCase.next_case - cases.length;
	const to = nextCase.next_case - 1;

	const embed: APIEmbed = {
		author: {
			name: `${user.tag} (${user.id})`,
			icon_url: user.displayAvatarURL(),
		},
		description: generateAntiRaidNukeCaseLog(cases, reason, locale),
		footer: {
			text: i18next.t('log.mod_log.anti_raid_nuke.footer', { from, to, lng: locale }),
		},
		timestamp: new Date().toISOString(),
	};

	const logMessage = await logChannel!.send({
		embeds: [embed],
	});

	await sql`update cases
		set log_message_id = ${logMessage.id}
		where guild_id = ${guild.id}
			and case_id in ${sql(cases.map((case_) => case_.caseId))}`;
}

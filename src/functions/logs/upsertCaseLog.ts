import type { APIEmbed } from 'discord-api-types/v9';
import { Client, Snowflake, User } from 'discord.js';
import i18next from 'i18next';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';

import { kSQL } from '../../tokens';
import type { Case } from '../cases/createCase';
import { checkLogChannel } from '../settings/checkLogChannel';
import { getGuildSetting, SettingsKeys } from '../settings/getGuildSetting';
import { generateCaseLog, generateCaseColor } from './generateCaseLog';

export async function upsertCaseLog(guildId: Snowflake, user: User | undefined | null, case_: Case) {
	const client = container.resolve<Client<true>>(Client);
	const sql = container.resolve<Sql<any>>(kSQL);

	const guild = await client.guilds.fetch(guildId);

	const locale = await getGuildSetting(guild.id, SettingsKeys.Locale);
	const logChannel = await checkLogChannel(guild, await getGuildSetting(guild.id, SettingsKeys.ModLogChannelId));

	let embed: APIEmbed = {
		color: generateCaseColor(case_),
		description: await generateCaseLog(guild.client, case_, logChannel!.id, locale),
		footer: {
			text: i18next.t('log.mod_log.case_log.footer', { caseId: case_.caseId, lng: locale }),
		},
		timestamp: new Date().toISOString(),
	};

	if (user) {
		embed = {
			...embed,
			author: {
				name: `${user.tag} (${user.id})`,
				icon_url: user.displayAvatarURL(),
			},
		};
	}

	if (case_.logMessageId) {
		const message = await logChannel!.messages.fetch(case_.logMessageId);
		await message.edit({
			// @ts-expect-error
			embeds: [embed],
		});
	} else {
		const logMessage = await logChannel!.send({
			// @ts-expect-error
			embeds: [embed],
		});

		await sql`update cases
			set log_message_id = ${logMessage.id}
			where guild_id = ${case_.guildId}
				and case_id = ${case_.caseId}`;
	}
}

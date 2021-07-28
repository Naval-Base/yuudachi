import type { APIEmbed } from 'discord-api-types/v9';
import type { Guild, TextChannel, User } from 'discord.js';
import i18next from 'i18next';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';

import { kSQL } from '../../tokens';
import type { Case } from '../cases/createCase';
import { getGuildSetting, SettingsKeys } from '../settings/getGuildSetting';
import { generateCaseLog } from './generateCaseLog';

export async function upsertCaseLog(guild: Guild, user: User, logChannel: TextChannel, case_: Case) {
	const sql = container.resolve<Sql<any>>(kSQL);
	const locale = await getGuildSetting(guild.id, SettingsKeys.Locale);

	const embed: APIEmbed = {
		author: {
			name: `${user.tag} (${user.id})`,
			icon_url: user.displayAvatarURL(),
		},
		description: await generateCaseLog(guild.client, case_, logChannel.id, locale),
		footer: {
			text: i18next.t('log.mod_log.case_log.footer', { caseId: case_.caseId, lng: locale }),
		},
		timestamp: new Date().toISOString(),
	};

	if (case_.logMessageId) {
		const message = await logChannel.messages.fetch(case_.logMessageId);
		await message.edit({
			// @ts-expect-error
			embeds: [embed],
		});
	} else {
		const logMessage = await logChannel.send({
			// @ts-expect-error
			embeds: [embed],
		});

		await sql`update cases
			set log_message_id = ${logMessage.id}
			where guild_id = ${case_.guildId}
				and case_id = ${case_.caseId}`;
	}
}

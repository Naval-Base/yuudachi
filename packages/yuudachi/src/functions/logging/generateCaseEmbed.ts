import type { APIEmbed } from 'discord-api-types/v10';
import { Client, type Snowflake, type User } from 'discord.js';
import i18next from 'i18next';
import { container } from 'tsyringe';
import { generateCaseColor } from './generateCaseColor.js';
import { generateCaseLog } from './generateCaseLog.js';
import type { Case } from '../cases/createCase.js';
import { getGuildSetting, SettingsKeys } from '../settings/getGuildSetting.js';

export async function generateCaseEmbed(
	guildId: Snowflake,
	logChannelId: string,
	user: User | undefined | null,
	case_: Case,
) {
	const client = container.resolve<Client<true>>(Client);
	const locale = await getGuildSetting(guildId, SettingsKeys.Locale);

	let embed: APIEmbed = {
		color: generateCaseColor(case_),
		description: await generateCaseLog(client, case_, logChannelId, locale),
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
	return embed;
}

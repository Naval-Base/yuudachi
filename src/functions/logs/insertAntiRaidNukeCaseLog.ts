import type { APIEmbed } from 'discord-api-types/v9';
import type { Guild, TextChannel, User } from 'discord.js';
import i18next from 'i18next';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';
import { generateAntiRaidNukeCaseLog } from './generateAntiRaidNukeCaseLog';
import { kSQL } from '../../tokens';
import type { Case } from '../cases/createCase';
import { getGuildSetting, SettingsKeys } from '../settings/getGuildSetting';

export async function insertAntiRaidNukeCaseLog(
	guild: Guild,
	user: User,
	logChannel: TextChannel,
	cases: Case[],
	reason: string,
) {
	const sql = container.resolve<Sql<any>>(kSQL);
	const locale = (await getGuildSetting(guild.id, SettingsKeys.Locale)) as string;

	const [nextCase] = await sql<[{ next_case: number }]>`select next_case(${guild.id});`;
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

	const logMessage = await logChannel.send({
		embeds: [embed],
	});

	await sql`update cases
		set log_message_id = ${logMessage.id}
		where guild_id = ${guild.id}
			and case_id in (${cases.map((case_) => case_.caseId)})`;
}

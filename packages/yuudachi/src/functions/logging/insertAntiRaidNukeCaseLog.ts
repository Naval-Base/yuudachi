import { kSQL, addFields, container } from "@yuudachi/framework";
import type { Guild, User } from "discord.js";
import i18next from "i18next";
import type { Sql } from "postgres";
import type { Case } from "../cases/createCase.js";
import { checkLogChannel } from "../settings/checkLogChannel.js";
import { getGuildSetting, SettingsKeys } from "../settings/getGuildSetting.js";
import { generateAntiRaidNukeCaseLog } from "./generateAntiRaidNukeCaseLog.js";

export async function insertAntiRaidNukeCaseLog(
	guild: Guild,
	user: User,
	cases: Case[],
	reason: string,
	messageUrl: string,
) {
	const sql = container.resolve<Sql<any>>(kSQL);
	const locale = await getGuildSetting(guild.id, SettingsKeys.Locale);
	const modLogChannel = checkLogChannel(guild, await getGuildSetting(guild.id, SettingsKeys.ModLogChannelId));

	const [nextCase] = await sql<[{ next_case: number }]>`select next_case(${guild.id});`;
	const from = nextCase.next_case - cases.length;
	const to = nextCase.next_case - 1;

	const embed = addFields({
		author: {
			name: `${user.tag} (${user.id})`,
			icon_url: user.displayAvatarURL(),
		},
		description: await generateAntiRaidNukeCaseLog(guild.id, cases, reason, messageUrl),
		footer: {
			text:
				cases.length === 1
					? i18next.t("log.mod_log.case_log.footer", { case_id: from, lng: locale })
					: i18next.t("log.mod_log.anti_raid_nuke.footer", { from, to, lng: locale }),
		},
		timestamp: new Date().toISOString(),
	});

	const logMessage = await modLogChannel!.send({
		embeds: [embed],
	});

	await sql`
		update cases
			set log_message_id = ${logMessage.id}
			where guild_id = ${guild.id}
				and case_id in ${sql(cases.map((case_) => case_.caseId))}
	`;

	return logMessage;
}

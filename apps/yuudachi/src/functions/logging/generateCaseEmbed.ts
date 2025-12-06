import { addFields } from "@yuudachi/framework";
import type { PartialUser, Snowflake, User } from "discord.js";
import i18next from "i18next";
import type { Case } from "../cases/createCase.js";
import { getGuildSetting, SettingsKeys } from "../settings/getGuildSetting.js";
import { generateCaseColor } from "./generateCaseColor.js";
import { generateCaseLog } from "./generateCaseLog.js";

export async function generateCaseEmbed(
	guildId: Snowflake,
	logChannelId: Snowflake,
	user: PartialUser | User | null | undefined,
	case_: Case,
) {
	const locale = await getGuildSetting(guildId, SettingsKeys.Locale);

	let embed = addFields({
		color: generateCaseColor(case_),
		description: await generateCaseLog(case_, logChannelId, locale),
		footer: {
			text: i18next.t("log.mod_log.case_log.footer", { case_id: case_.caseId, lng: locale }),
		},
		timestamp: new Date(case_.createdAt).toISOString(),
	});

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

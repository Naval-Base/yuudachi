import { type Snowflake } from "discord.js";
import i18next from "i18next";
import type { Case } from "../cases/createCase.js";
import { getGuildSetting, SettingsKeys } from "../settings/getGuildSetting.js";

export async function generateAntiRaidNukeCaseLog(guildId: Snowflake, cases: Case[], reason: string) {
	const locale = await getGuildSetting(guildId, SettingsKeys.Locale);

	const msg = [
		i18next.t("log.mod_log.anti_raid_nuke.description", {
			reason,
			count: cases.length,
			lng: locale,
		}),
	];

	return msg.join("\n");
}

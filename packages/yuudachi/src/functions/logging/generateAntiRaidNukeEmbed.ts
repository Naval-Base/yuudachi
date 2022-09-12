import type { User } from "discord.js";
import i18next from "i18next";
import { Color } from "../../Constants.js";
import { addFields } from "../../util/embed.js";

export function generateAntiRaidNukeEmbed(hitCount: number, user: User, locale: string) {
	return addFields({
		title: i18next.t("log.anti_raid_nuke.title", { lng: locale }),
		description: i18next.t("log.anti_raid_nuke.description", {
			moderator: `\`${user.tag}\` (${user.id})`,
			count: hitCount,
			lng: locale,
		}),
		color: Color.DiscordDanger,
	});
}

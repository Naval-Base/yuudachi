import { kSQL } from "@yuudachi/framework";
import { messageLink, type Snowflake } from "discord.js";
import i18next from "i18next";
import type { Sql } from "postgres";
import { container } from "tsyringe";
import type { Case } from "../cases/createCase.js";
import { getGuildSetting, SettingsKeys } from "../settings/getGuildSetting.js";

export async function generateCaseContent(guildId: Snowflake, case_: Case): Promise<string | null> {
	const locale = await getGuildSetting(guildId, SettingsKeys.Locale);
	const sql = container.resolve<Sql<any>>(kSQL);

	const msg = [];

	if (case_.contextMessageId) {
		const [contextMessage] = await sql<[{ channel_id: Snowflake | null }?]>`
			select channel_id
			from messages
			where id = ${case_.contextMessageId}
		`;

		if (Reflect.has(contextMessage ?? {}, "channel_id")) {
			msg.push(
				i18next.t("log.mod_log.case_log.context_sub", {
					lng: locale,
					message_link: messageLink(contextMessage!.channel_id!, case_.contextMessageId, case_.guildId),
				}),
			);
		}
	}

	return msg.length ? msg.join("\n") : null;
}

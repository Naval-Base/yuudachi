import { kSQL, container } from "@yuudachi/framework";
import type { Guild, User } from "discord.js";
import type { Sql } from "postgres";
import type { Case } from "../cases/createCase.js";
import { checkLogChannel } from "../settings/checkLogChannel.js";
import { getGuildSetting, SettingsKeys } from "../settings/getGuildSetting.js";
import { generateCaseContent } from "./generateCaseContent.js";
import { generateCaseEmbed } from "./generateCaseEmbed.js";

export async function upsertCaseLog(guild: Guild, user: User | null | undefined, case_: Case) {
	const sql = container.resolve<Sql<{}>>(kSQL);
	const modLogChannel = checkLogChannel(guild, await getGuildSetting(guild.id, SettingsKeys.ModLogChannelId));

	const embed = await generateCaseEmbed(guild.id, modLogChannel!.id, user, case_);
	const content = await generateCaseContent(guild.id, case_);

	if (case_.logMessageId) {
		const message = await modLogChannel!.messages.fetch(case_.logMessageId);
		await message.edit({
			content,
			embeds: [embed],
		});
	} else {
		const logMessage = await modLogChannel!.send({
			content: content ?? undefined,
			embeds: [embed],
		});

		await sql`
			update cases
				set log_message_id = ${logMessage.id}
				where guild_id = ${case_.guildId}
					and case_id = ${case_.caseId}
		`;
	}
}

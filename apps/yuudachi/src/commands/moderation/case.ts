import { injectable } from "@needle-di/core";
import { Command, container, kSQL, truncateEmbed, createButton, createMessageActionRow } from "@yuudachi/framework";
import type { ArgsParam, InteractionParam, LocaleParam, CommandMethod } from "@yuudachi/framework/types";
import { ButtonStyle, MessageFlags, messageLink } from "discord.js";
import i18next from "i18next";
import type { Sql } from "postgres";
import { OP_DELIMITER } from "../../Constants.js";
import { handleCaseAutocomplete } from "../../functions/autocomplete/cases.js";
import { type RawCase, transformCase } from "../../functions/cases/transformCase.js";
import { generateCaseEmbed } from "../../functions/logging/generateCaseEmbed.js";
import { checkLogChannel } from "../../functions/settings/checkLogChannel.js";
import { getGuildSetting, SettingsKeys } from "../../functions/settings/getGuildSetting.js";
import type { CaseLookupCommand } from "../../interactions/index.js";
import { generateHistory } from "../../util/generateHistory.js";
import { resolveMemberAndUser } from "../../util/resolveMemberAndUser.js";

@injectable()
export default class extends Command<typeof CaseLookupCommand> {
	public override async autocomplete(
		interaction: InteractionParam<CommandMethod.Autocomplete>,
		_: ArgsParam<typeof CaseLookupCommand>,
		locale: LocaleParam,
	): Promise<void> {
		await handleCaseAutocomplete(interaction, locale, true);
	}

	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<typeof CaseLookupCommand>,
		locale: LocaleParam,
	): Promise<void> {
		const sql = container.get<Sql<any>>(kSQL);
		await interaction.deferReply({ flags: args.hide ? MessageFlags.Ephemeral : undefined });

		const [cmd, id] = args.phrase.split(OP_DELIMITER);

		if (cmd === "history" && id) {
			const data = await resolveMemberAndUser(interaction.guild, id);
			const embed = truncateEmbed(await generateHistory(interaction, data, locale));

			await interaction.editReply({
				embeds: [embed],
			});
			return;
		}

		if (!Number.isNaN(Number.parseInt(args.phrase, 10))) {
			const [modCase] = await sql<RawCase[]>`
				select *
				from cases
				where guild_id = ${interaction.guildId}
				and case_id = ${args.phrase}
			`;

			if (!modCase) {
				throw new Error(i18next.t("command.common.errors.use_autocomplete", { lng: locale }));
			}

			const modLogChannel = checkLogChannel(
				interaction.guild,
				await getGuildSetting(interaction.guildId, SettingsKeys.ModLogChannelId),
			);
			const moderator = await interaction.client.users.fetch(modCase.mod_id);

			const gotoButton = createButton({
				label: i18next.t("command.mod.case.buttons.goto", {
					case: modCase.case_id,
					lng: locale,
				}),
				style: ButtonStyle.Link,
				disabled: !modLogChannel?.id || !modCase.log_message_id,
				url: messageLink(modLogChannel!.id, modCase.log_message_id!, interaction.guildId),
			});

			await interaction.editReply({
				embeds: [
					truncateEmbed(
						await generateCaseEmbed(interaction.guildId, modLogChannel!.id, moderator, transformCase(modCase)),
					),
				],
				components: [createMessageActionRow([gotoButton])],
			});
			return;
		}

		throw new Error(i18next.t("command.common.errors.use_autocomplete", { lng: locale }));
	}
}

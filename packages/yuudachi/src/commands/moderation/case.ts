import {
	Command,
	container,
	logger,
	kSQL,
	ellipsis,
	truncateEmbed,
	AUTOCOMPLETE_CHOICE_LIMIT,
	AUTOCOMPLETE_CHOICE_NAME_LENGTH_LIMIT,
	createButton,
	createMessageActionRow,
} from "@yuudachi/framework";
import type { ArgsParam, InteractionParam, LocaleParam, CommandMethod } from "@yuudachi/framework/types";
import { ButtonStyle, Collection, messageLink, type Snowflake } from "discord.js";
import i18next from "i18next";
import type { Sql } from "postgres";
import { OP_DELIMITER } from "../../Constants.js";
import type { CaseAction } from "../../functions/cases/createCase.js";
import { findCases } from "../../functions/cases/findCases.js";
import { type RawCase, transformCase } from "../../functions/cases/transformCase.js";
import { generateCaseEmbed } from "../../functions/logging/generateCaseEmbed.js";
import { checkLogChannel } from "../../functions/settings/checkLogChannel.js";
import { getGuildSetting, SettingsKeys } from "../../functions/settings/getGuildSetting.js";
import type { CaseLookupCommand } from "../../interactions/index.js";
import { caseActionLabel } from "../../util/actionKeys.js";
import { generateHistory } from "../../util/generateHistory.js";
import { resolveMemberAndUser } from "../../util/resolveMemberAndUser.js";

export default class extends Command<typeof CaseLookupCommand> {
	public override async autocomplete(
		interaction: InteractionParam<CommandMethod.Autocomplete>,
		args: ArgsParam<typeof CaseLookupCommand>,
		locale: LocaleParam,
	): Promise<void> {
		try {
			const trimmedPhrase = args.phrase.trim();
			const cases = await findCases(trimmedPhrase, interaction.guildId);
			let choices = cases.map((case_) => {
				const choiceName = `#${case_.case_id} ${caseActionLabel(case_.action as CaseAction, locale).toUpperCase()} ${
					case_.target_tag
				}: ${
					case_.reason ??
					i18next.t("command.mod.case.autocomplete.no_reason", {
						lng: locale,
					})!
				}`;

				return {
					name: ellipsis(choiceName, AUTOCOMPLETE_CHOICE_NAME_LENGTH_LIMIT),
					value: String(case_.case_id),
				} as const;
			});

			const uniqueTargets = new Collection<string, { id: Snowflake; tag: string }>();

			for (const case_ of cases) {
				if (uniqueTargets.has(case_.target_id)) {
					continue;
				}

				uniqueTargets.set(case_.target_id, { id: case_.target_id, tag: case_.target_tag });
			}

			if (uniqueTargets.size === 1) {
				const target = uniqueTargets.first()!;
				choices = [
					{
						name: ellipsis(
							i18next.t("command.mod.case.autocomplete.show_history", {
								user: target.tag,
								lng: locale,
							})!,
							AUTOCOMPLETE_CHOICE_NAME_LENGTH_LIMIT,
						),
						value: `history${OP_DELIMITER}${target.id}`,
					},
					...choices,
				];

				if (choices.length > AUTOCOMPLETE_CHOICE_LIMIT) {
					choices.length = AUTOCOMPLETE_CHOICE_LIMIT;
				}
			}

			await interaction.respond(choices.slice(0, 25));
		} catch (error_) {
			const error = error_ as Error;
			logger.error(error, error.message);
		}
	}

	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<typeof CaseLookupCommand>,
		locale: LocaleParam,
	): Promise<void> {
		const sql = container.resolve<Sql<any>>(kSQL);
		await interaction.deferReply({ ephemeral: args.hide ?? true });

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

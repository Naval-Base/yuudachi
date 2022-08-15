import { Collection, type Guild, type Snowflake } from "discord.js";
import i18next from "i18next";
import type { Sql } from "postgres";
import { container } from "tsyringe";
import { type ArgsParam, Command, type InteractionParam, type LocaleParam, type CommandMethod } from "../../Command.js";
import { AUTOCOMPLETE_CHOICE_LIMIT, AUTOCOMPLETE_CHOICE_NAME_LENGTH_LIMIT } from "../../Constants.js";
import { type RawCase, transformCase } from "../../functions/cases/transformCase.js";
import { generateCaseEmbed } from "../../functions/logging/generateCaseEmbed.js";
import { checkLogChannel } from "../../functions/settings/checkLogChannel.js";
import { getGuildSetting, SettingsKeys } from "../../functions/settings/getGuildSetting.js";
import type { CaseLookupCommand } from "../../interactions/index.js";
import { logger } from "../../logger.js";
import { kSQL } from "../../tokens.js";
import { ACTION_KEYS } from "../../util/actionKeys.js";
import { ellipsis, truncateEmbed } from "../../util/embed.js";
import { findCases } from "../../util/findCases.js";
import { generateHistory } from "../../util/generateHistory.js";

const OP_DELIMITER = "-" as const;

async function resolveMemberAndUser(guild: Guild, id: Snowflake) {
	try {
		const member = await guild.members.fetch(id);

		return { member, user: member.user } as const;
	} catch {
		const user = await guild.client.users.fetch(id);

		return { user } as const;
	}
}

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
				const choiceName = `#${case_.case_id} ${ACTION_KEYS[case_.action]!.toUpperCase()} ${case_.target_tag}: ${
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
			await interaction.editReply({
				embeds: await generateHistory(interaction, data, locale),
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

			await interaction.editReply({
				embeds: [
					truncateEmbed(
						await generateCaseEmbed(interaction.guildId, modLogChannel!.id, moderator, transformCase(modCase)),
					),
				],
			});
			return;
		}

		throw new Error(i18next.t("command.common.errors.use_autocomplete", { lng: locale }));
	}
}

import { Collection, type Snowflake } from 'discord.js';
import i18next from 'i18next';
import { lookup } from './sub/reports/lookup.js';
import { status } from './sub/reports/status.js';
import { type ArgsParam, Command, type InteractionParam, type LocaleParam, type CommandMethod } from '../../Command.js';
import {
	AUTOCOMPLETE_CHOICE_LIMIT,
	AUTOCOMPLETE_CHOICE_NAME_LENGTH_LIMIT,
	OP_DELIMITER,
	SNOWFLAKE_MIN_LENGTH,
} from '../../Constants.js';
import { ReportType } from '../../functions/reports/createReport.js';
import { findReports } from '../../functions/reports/findReports.js';
import type { ReportUtilsCommand } from '../../interactions/index.js';
import { logger } from '../../logger.js';
import { REPORT_KEYS } from '../../util/actionKeys.js';
import { ellipsis } from '../../util/embed.js';

export default class extends Command<typeof ReportUtilsCommand> {
	public override async autocomplete(
		interaction: InteractionParam<CommandMethod.Autocomplete>,
		args: ArgsParam<typeof ReportUtilsCommand>,
		locale: LocaleParam,
	): Promise<void> {
		try {
			const trimmedPhrase = args.lookup.phrase.trim();
			const reports = await findReports(trimmedPhrase, interaction.guildId);
			let choices = reports.map((r) => {
				const choiceName = `#${r.report_id} ${r.type === ReportType.Message ? '✉️' : '👤'} ${REPORT_KEYS[
					r.status
				]!.toUpperCase()} ${r.author_tag} ➜ ${r.target_tag}: ${r.reason}`;

				return {
					name: ellipsis(choiceName, AUTOCOMPLETE_CHOICE_NAME_LENGTH_LIMIT),
					value: String(r.report_id),
				} as const;
			});

			const uniqueTargets = new Collection<string, { id: Snowflake; tag: string }>();
			const uniqueAuthors = new Collection<string, { id: Snowflake; tag: string }>();

			for (const r of reports) {
				if (!uniqueTargets.has(r.target_id)) {
					uniqueTargets.set(r.target_id, { id: r.target_id, tag: r.target_tag });
				}

				if (!uniqueAuthors.has(r.author_id)) {
					uniqueAuthors.set(r.author_id, { id: r.author_id, tag: r.author_tag });
				}
			}

			let historyAdded = false;

			if (uniqueTargets.size === 1) {
				const target = uniqueTargets.first()!;
				choices = [
					{
						name: ellipsis(
							i18next.t('command.mod.reports.autocomplete.show_history_target', {
								user: target.tag,
								lng: locale,
							})!,
							AUTOCOMPLETE_CHOICE_NAME_LENGTH_LIMIT,
						),
						value: `history${OP_DELIMITER}${target.id}`,
					},
					...choices,
				];
				historyAdded = true;
			}

			if (uniqueAuthors.size === 1) {
				const author = uniqueAuthors.first()!;
				choices = [
					{
						name: ellipsis(
							i18next.t('command.mod.reports.autocomplete.show_history_author', {
								user: author.tag,
								lng: locale,
							})!,
							AUTOCOMPLETE_CHOICE_NAME_LENGTH_LIMIT,
						),
						value: `history${OP_DELIMITER}${author.id}`,
					},
					...choices,
				];
				historyAdded = true;
			}

			if (!historyAdded && !isNaN(parseInt(trimmedPhrase, 10)) && trimmedPhrase.length >= SNOWFLAKE_MIN_LENGTH) {
				const user = interaction.client.users.cache.get(trimmedPhrase);

				if (user) {
					choices = [
						{
							name: ellipsis(
								i18next.t('command.mod.reports.autocomplete.show_history_target', {
									user: user.tag,
									lng: locale,
								})!,
								AUTOCOMPLETE_CHOICE_NAME_LENGTH_LIMIT,
							),
							value: `history${OP_DELIMITER}${user.id}`,
						},
						...choices,
					];
				}
			}

			await interaction.respond(choices.slice(0, AUTOCOMPLETE_CHOICE_LIMIT));
		} catch (err) {
			const error = err as Error;
			logger.error(error, error.message);
		}
	}

	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<typeof ReportUtilsCommand>,
		locale: LocaleParam,
	): Promise<void> {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		await interaction.deferReply({ ephemeral: args.lookup?.hide ?? true });

		switch (Object.keys(args)[0]) {
			case 'lookup':
				await lookup(interaction, args.lookup, locale);
				break;
			case 'status':
				await status(interaction, args.status, locale);
				break;
			default:
		}
	}
}

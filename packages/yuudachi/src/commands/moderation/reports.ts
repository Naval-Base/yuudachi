import { Collection, type Message, type Snowflake } from 'discord.js';
import i18next from 'i18next';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';
import { type ArgsParam, Command, type InteractionParam, type LocaleParam, type CommandMethod } from '../../Command.js';
import { AUTOCOMPLETE_CHOICE_LIMIT, AUTOCOMPLETE_CHOICE_NAME_LENGTH_LIMIT } from '../../Constants.js';
import { formatMessageToEmbed } from '../../functions/logging/formatMessageToEmbed.js';
import { generateReportEmbed } from '../../functions/logging/generateReportEmbed.js';
import { ReportType } from '../../functions/reports/createReport.js';
import { findReports } from '../../functions/reports/findReports.js';
import { type RawReport, transformReport } from '../../functions/reports/transformReport.js';
import type { ReportLookupCommand } from '../../interactions/index.js';
import { logger } from '../../logger.js';
import { kSQL } from '../../tokens.js';
import { REPORT_KEYS } from '../../util/actionKeys.js';
import { ellipsis, truncateEmbed } from '../../util/embed.js';
import { generateHistory, generateUserInfo, HistoryType } from '../../util/generateHistory.js';
import { resolveMemberAndUser } from '../../util/resolveMemberAndUser.js';
import { resolveMessage } from '../../util/resolveMessage.js';

const OP_DELIMITER = '-' as const;

export default class extends Command<typeof ReportLookupCommand> {
	public override async autocomplete(
		interaction: InteractionParam<CommandMethod.Autocomplete>,
		args: ArgsParam<typeof ReportLookupCommand>,
		locale: LocaleParam,
	): Promise<void> {
		try {
			const trimmedPhrase = args.phrase.trim();
			const reports = await findReports(trimmedPhrase, interaction.guildId);
			let choices = reports.map((r) => {
				const choiceName = `#${r.report_id} ${i18next.t(`log.report_log.report_type.${r.type}`, {
					lng: locale,
				})} ${REPORT_KEYS[r.status]!.toUpperCase()} ${r.author_tag} ➜ ${r.target_tag}: ${r.reason}`;

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

			if (uniqueTargets.size === 1 && uniqueAuthors.size === 1) {
				const target = uniqueTargets.first()!;
				const author = uniqueAuthors.first()!;
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

				if (choices.length > AUTOCOMPLETE_CHOICE_LIMIT) {
					choices.length = AUTOCOMPLETE_CHOICE_LIMIT;
				}
			}

			await interaction.respond(choices.slice(0, 25));
		} catch (err) {
			const error = err as Error;
			logger.error(error, error.message);
		}
	}

	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<typeof ReportLookupCommand>,
		locale: LocaleParam,
	): Promise<void> {
		const sql = container.resolve<Sql<any>>(kSQL);
		await interaction.deferReply({ ephemeral: args.hide ?? true });

		const [cmd, id] = args.phrase.split(OP_DELIMITER);

		if (cmd === 'history' && id) {
			const data = await resolveMemberAndUser(interaction.guild, id);
			await interaction.editReply({
				embeds: await generateHistory(interaction, data, locale, HistoryType.Report),
			});
			return;
		}

		if (!isNaN(parseInt(args.phrase, 10))) {
			const [report] = await sql<RawReport[]>`
				select *
				from reports
				where guild_id = ${interaction.guildId}
				and report_id = ${args.phrase}`;

			if (!report) {
				throw new Error(i18next.t('command.common.errors.use_autocomplete', { lng: locale }));
			}

			const message = report.message_id
				? await resolveMessage(interaction.channelId, report.guild_id, report.channel_id!, report.message_id, locale)
				: undefined;

			const author = await interaction.client.users.fetch(report.author_id);

			const embeds = [truncateEmbed(await generateReportEmbed(author, transformReport(report), locale, message))];

			if (message) {
				embeds.push(truncateEmbed(await formatMessageToEmbed(message as Message<true>, locale)));
			}

			if (report.type === ReportType.User) {
				const target = await resolveMemberAndUser(interaction.guild, report.target_id);
				embeds.push(truncateEmbed(generateUserInfo(target, locale)));
			}

			await interaction.editReply({
				embeds,
			});
			return;
		}

		throw new Error(i18next.t('command.common.errors.use_autocomplete', { lng: locale }));
	}
}

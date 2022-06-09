import { AutocompleteInteraction, Collection, CommandInteraction, Guild } from 'discord.js';
import i18next from 'i18next';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';
import type { Command } from '../../Command.js';
import { RawCase, transformCase } from '../../functions/cases/transformCase.js';
import { generateCaseEmbed } from '../../functions/logging/generateCaseEmbed.js';
import { checkLogChannel } from '../../functions/settings/checkLogChannel.js';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting.js';
import type { ArgumentsOf } from '../../interactions/ArgumentsOf.js';
import type { CaseLookupCommand } from '../../interactions/index.js';
import { logger } from '../../logger.js';
import { kSQL } from '../../tokens.js';
import { ACTION_KEYS } from '../../util/actionKeys.js';
import { findCases } from '../../util/findCases.js';
import { generateHistory } from '../../util/generateHistory.js';

const OP_DELIMITER = '-' as const;

async function resolveMemberAndUser(guild: Guild, id: string) {
	try {
		const member = await guild.members.fetch(id);
		return { member, user: member.user };
	} catch {
		const user = await guild.client.users.fetch(id);
		return { user };
	}
}

export default class implements Command {
	public async autocomplete(
		interaction: AutocompleteInteraction<'cached'>,
		args: ArgumentsOf<typeof CaseLookupCommand>,
		locale: string,
	): Promise<void> {
		try {
			const trimmedPhrase = args.phrase.trim();
			const cases = await findCases(trimmedPhrase, interaction.guildId);
			const choices = cases.map((c) => ({
				name: `#${c.case_id} ${ACTION_KEYS[c.action]!.toUpperCase()} ${c.target_tag}: ${
					c.reason ??
					i18next.t('command.mod.case.autocomplete.no_reason', {
						lng: locale,
					})!
				}`,
				value: String(c.case_id),
			}));

			const uniqueTargets = new Collection<string, { id: string; tag: string }>();

			for (const c of cases) {
				uniqueTargets.set(c.target_id, { id: c.target_id, tag: c.target_tag });
			}

			if (uniqueTargets.size === 1) {
				const target = uniqueTargets.first()!;
				try {
					if (choices.length >= 25) {
						choices.length = 25;
						choices.splice(-1, 1, {
							name: i18next.t('command.mod.case.autocomplete.show_history', {
								lng: locale,
								user: target.tag,
							})!,
							value: `history${OP_DELIMITER}${target.id}`,
						});
					} else {
						choices.push({
							name: i18next.t('command.mod.case.autocomplete.show_history', {
								lng: locale,
								user: target.tag,
							})!,
							value: `history${OP_DELIMITER}${target.id}`,
						});
					}
				} catch {}
			}

			await interaction.respond(choices.slice(0, 25));
		} catch (err) {
			const error = err as Error;
			logger.error(error, error.message);
		}
	}

	public async execute(
		interaction: CommandInteraction<'cached'>,
		args: ArgumentsOf<typeof CaseLookupCommand>,
		locale: string,
	): Promise<void> {
		const sql = container.resolve<Sql<any>>(kSQL);
		await interaction.deferReply({ ephemeral: args.hide ?? true });

		const [cmd, id] = args.phrase.split(OP_DELIMITER);
		if (cmd === 'history' && id) {
			const data = await resolveMemberAndUser(interaction.guild, id);
			await interaction.editReply({
				embeds: [await generateHistory(interaction, data, locale)],
			});
			return;
		}

		if (!isNaN(parseInt(args.phrase, 10))) {
			const [modCase] = await sql<RawCase[]>`
			select *
			from cases
			where guild_id = ${interaction.guildId}
			and case_id = ${args.phrase}`;

			if (!modCase) {
				throw new Error(i18next.t('command.common.errors.use_autocomplete', { lng: locale }));
			}

			const logChannel = await checkLogChannel(
				interaction.guild,
				(await getGuildSetting(interaction.guildId, SettingsKeys.ModLogChannelId)) as string,
			);
			const moderator = await interaction.client.users.fetch(modCase.mod_id);

			await interaction.editReply({
				embeds: [await generateCaseEmbed(interaction.guildId, logChannel!.id, moderator, transformCase(modCase))],
			});
			return;
		}

		throw new Error(i18next.t('command.common.errors.use_autocomplete', { lng: locale }));
	}
}

import type { BaseCommandInteraction } from 'discord.js';
import i18next from 'i18next';
import type { APIEmbed } from 'discord-api-types';

import type { ArgumentsOf } from '../../interactions/ArgumentsOf';
import type { Command } from '../../Command';
import type { CheckScamCommand } from '../../interactions';
import { checkScam } from '../../functions/anti-scam/checkScam';
import { addFields, truncateEmbed } from '../../util/embed';
import { checkModRole } from '../../functions/permissions/checkModRole';

export default class implements Command {
	public async execute(
		interaction: BaseCommandInteraction,
		args: ArgumentsOf<typeof CheckScamCommand>,
		locale: string,
	): Promise<void> {
		await interaction.deferReply({ ephemeral: args.hide ?? true });
		await checkModRole(interaction, locale);

		const domains = await checkScam(args.content);

		let embed: APIEmbed = {
			color: domains.length ? 16462404 : 3908957,
			description: args.content,
		};

		if (domains.length) {
			embed = addFields(embed, {
				name: i18next.t('command.utility.check_scam.found', { lng: locale, count: domains.length }),
				value: domains.map((domain) => `• \`${domain.host}\` on lists: \`[${domain.lists.join(',')}]\``).join('\n'),
			});
		}

		await interaction.editReply({ embeds: [truncateEmbed(embed)] });
	}
}

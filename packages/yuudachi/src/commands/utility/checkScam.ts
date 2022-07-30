import type { CommandInteraction, APIEmbed } from 'discord.js';
import i18next from 'i18next';
import type { Command } from '../../Command.js';
import { checkScam } from '../../functions/anti-scam/checkScam.js';
import type { ArgumentsOf } from '../../interactions/ArgumentsOf.js';
import type { CheckScamCommand } from '../../interactions/index.js';
import { addFields, truncateEmbed } from '../../util/embed.js';

export default class implements Command {
	public async execute(
		interaction: CommandInteraction,
		args: ArgumentsOf<typeof CheckScamCommand>,
		locale: string,
	): Promise<void> {
		await interaction.deferReply({ ephemeral: args.hide ?? true });

		const domains = await checkScam(args.content);

		let embed: APIEmbed = {
			color: domains.length ? 16462404 : 3908957,
			description: args.content,
		};

		if (domains.length) {
			embed = addFields(embed, {
				name: i18next.t('command.utility.check_scam.found', { count: domains.length, lng: locale }),
				value: domains.map((domain) => `• \`${domain.host}\` on lists: \`[${domain.lists.join(',')}]\``).join('\n'),
			});
		}

		await interaction.editReply({ embeds: [truncateEmbed(embed)] });
	}
}

import { BaseCommandInteraction, MessageEmbed } from 'discord.js';
import i18next from 'i18next';
import type { Redis } from 'ioredis';
import { container } from 'tsyringe';

import type { ArgumentsOf } from '../../interactions/ArgumentsOf';
import type { Command } from '../../Command';
import type { CheckScamCommand } from '../../interactions';
import { kRedis } from '../../tokens';
import { checkScam } from '../../functions/anti-scam/checkScam';
import { truncateEmbed } from '../../util/embed';

export default class implements Command {
	public async execute(
		interaction: BaseCommandInteraction,
		args: ArgumentsOf<typeof CheckScamCommand>,
		locale: string,
	): Promise<void> {
		const redis = container.resolve<Redis>(kRedis);
		const domains = await checkScam(args.content);
		const cardinality = await redis.scard('scamdomains');

		const embed = new MessageEmbed()
			.setColor(domains.length ? 16462404 : 3908957)
			.setDescription(args.content)
			.setFooter(
				i18next.t('command.utility.check_scam.cache', { lng: locale, count: cardinality }),
				interaction.client.user?.displayAvatarURL(),
			);

		if (domains.length) {
			embed.addField(
				i18next.t('command.utility.check_scam.found', { lng: locale, count: domains.length }),
				domains.map((domain) => `• \`${domain}\``).join('\n'),
			);
		}

		await interaction.deferReply({ ephemeral: args.hide ?? true });

		await interaction.editReply({ embeds: [truncateEmbed(embed.toJSON())] });
	}
}

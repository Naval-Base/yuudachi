import { BaseCommandInteraction, Formatters, MessageEmbed } from 'discord.js';
import i18next from 'i18next';
import type { Redis } from 'ioredis';
import { container } from 'tsyringe';

import type { Command } from '../../Command';
import { kRedis } from '../../tokens';
import { logger } from '../../logger';
import { checkModRole } from '../../functions/permissions/checkModRole';
import { refreshScamDomains, scamURLEnvs } from '../../functions/anti-scam/refreshScamDomains';
import type { RefreshScamlistCommand } from '../../interactions';
import type { ArgumentsOf } from '../../interactions/ArgumentsOf';

export default class implements Command {
	public async execute(
		interaction: BaseCommandInteraction,
		_: ArgumentsOf<typeof RefreshScamlistCommand>,
		locale: string,
	): Promise<void> {
		const redis = container.resolve<Redis>(kRedis);

		await interaction.deferReply({ ephemeral: true });
		await checkModRole(interaction, locale);

		const missing = scamURLEnvs.filter((u) => !process.env[u]);

		if (missing.length) {
			logger.warn(`Missing environment variables: ${missing.join(', ')}.`);
		}

		if (missing.length === 2) {
			await interaction.editReply(i18next.t('command.utility.refresh_scamlist.missing_env', { lng: locale, missing }));
			return;
		}

		const embed = new MessageEmbed();
		const res = await refreshScamDomains(redis);
		for (const result of res) {
			const parts = [
				i18next.t('command.utility.refresh_scamlist.before', {
					lng: locale,
					amount: Formatters.inlineCode(String(result.before)),
				}),
				i18next.t('command.utility.refresh_scamlist.after', {
					lng: locale,
					amount: Formatters.inlineCode(String(result.after)),
				}),
				i18next.t('command.utility.refresh_scamlist.last_change', {
					lng: locale,
					timestamp: result.lastRefresh
						? `<t:${Math.floor(result.lastRefresh / 1000)}:f> (<t:${Math.floor(result.lastRefresh / 1000)}:R>)`
						: i18next.t('command.utility.refresh_scamlist.refresh_never', { lng: locale }),
				}),
			];

			embed.addField(result.envVar, parts.join('\n'), true).setColor(3092790);
		}

		await interaction.editReply({ embeds: [embed] });
	}
}

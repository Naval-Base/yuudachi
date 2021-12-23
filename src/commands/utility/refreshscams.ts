import type { BaseCommandInteraction } from 'discord.js';
import i18next from 'i18next';
import type { Redis } from 'ioredis';
import { container } from 'tsyringe';

import type { ArgumentsOf } from '../../interactions/ArgumentsOf';
import type { Command } from '../../Command';
import type { RefreshScamlistCommand } from '../../interactions';
import fetch, { Response } from 'node-fetch';

import { kRedis } from '../../tokens';
import { logger } from '../../logger';

export function checkResponse(response: Response) {
	if (response.ok) return response;
	logger.warn({ response }, 'Fetching scam domains returned a non 2xx response code.');
	return response;
}

export default class implements Command {
	public async execute(
		interaction: BaseCommandInteraction,
		args: ArgumentsOf<typeof RefreshScamlistCommand>,
		locale: string,
	): Promise<void> {
		const redis = container.resolve<Redis>(kRedis);
		await interaction.deferReply({ ephemeral: true });

		if (!process.env.SCAM_DOMAIN_URL) {
			logger.warn('Missing environment variable: SCAM_DOMAIN_URL.');
			await interaction.editReply(i18next.t('command.utility.refresh_scamlist.missing_env', { lng: locale }));
			return;
		}

		const list = await fetch(process.env.SCAM_DOMAIN_URL)
			.then(checkResponse)
			.then((r) => r.json());

		const lastRefresh = await redis.get('scamdomains:refresh');
		const before = await redis.scard('scamdomains');

		if (args.replace) {
			await redis.del('scamdomains');
		}

		await redis.sadd('scamdomains', ...list);
		const after = await redis.scard('scamdomains');

		logger.info(
			{
				before,
				after,
				replaced: args.replace ?? false,
				manual: true,
			},
			'Scam domains updated',
		);
		await redis.set('scamdomains:refresh', Date.now());

		await interaction.editReply(
			i18next.t(
				args.replace ? 'command.utility.refresh_scamlist.success_replace' : 'command.utility.refresh_scamlist.success',
				{
					lng: locale,
					before,
					after,
					refresh: lastRefresh
						? `<t:${Math.floor(parseInt(lastRefresh, 10) / 1000)}:f> (<t:${Math.floor(
								parseInt(lastRefresh, 10) / 1000,
						  )}:R>)`
						: i18next.t('command.utility.refresh_scamlist.refresh_never', { lng: locale }),
				},
			),
		);
	}
}

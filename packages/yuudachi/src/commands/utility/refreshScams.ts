import process from 'node:process';
import { ButtonStyle, ComponentType } from 'discord.js';
import i18next from 'i18next';
import type { Redis } from 'ioredis';
import { nanoid } from 'nanoid';
import { container } from 'tsyringe';
import { type ArgsParam, Command, type InteractionParam, type LocaleParam } from '../../Command.js';
import { Color } from '../../Constants.js';
import { refreshScamDomains, ScamRedisKeys, scamURLEnvs } from '../../functions/anti-scam/refreshScamDomains.js';
import type { RefreshScamlistCommand } from '../../interactions/index.js';
import { logger } from '../../logger.js';
import { kRedis } from '../../tokens.js';
import { createButton } from '../../util/button.js';
import { addFields } from '../../util/embed.js';
import { createMessageActionRow } from '../../util/messageActionRow.js';

export default class extends Command<typeof RefreshScamlistCommand> {
	public override async chatInput(
		interaction: InteractionParam,
		_: ArgsParam<typeof RefreshScamlistCommand>,
		locale: LocaleParam,
	): Promise<void> {
		const redis = container.resolve<Redis>(kRedis);

		const reply = await interaction.deferReply({ ephemeral: true });

		const missing = scamURLEnvs.filter((u) => !process.env[u]);

		if (missing.length) {
			logger.warn(`Missing environment variables: ${missing.join(', ')}.`);
		}

		if (missing.length === 2) {
			await interaction.editReply(i18next.t('command.utility.refresh_scamlist.missing_env', { missing, lng: locale }));
			return;
		}

		const refreshKey = nanoid();
		const cancelKey = nanoid();

		const refreshButton = createButton({
			customId: refreshKey,
			label: i18next.t('command.utility.refresh_scamlist.buttons.execute', { lng: locale }),
			style: ButtonStyle.Danger,
		});
		const cancelButton = createButton({
			customId: cancelKey,
			label: i18next.t('command.common.buttons.cancel', { lng: locale }),
			style: ButtonStyle.Secondary,
		});

		let embed = addFields({
			color: Color.DiscordEmbedBackground,
			title: i18next.t('command.utility.refresh_scamlist.pending', {
				lng: locale,
			}),
		});

		for (const urlEnv of scamURLEnvs) {
			const key = ScamRedisKeys[urlEnv];
			const num = await redis.scard(key);
			const lastRefresh = await redis.get(`${key}:refresh`);

			const parts = [
				i18next.t('command.utility.refresh_scamlist.amount', {
					count: num,
					lng: locale,
				}),

				i18next.t('command.utility.refresh_scamlist.last_change', {
					timestamp: lastRefresh
						? `<t:${Math.floor(parseInt(lastRefresh, 10) / 1000)}:f> (<t:${Math.floor(
								parseInt(lastRefresh, 10) / 1000,
						  )}:R>)`
						: i18next.t('command.utility.refresh_scamlist.refresh_never', { lng: locale }),
					lng: locale,
				}),
			];

			embed = addFields(embed, {
				name: urlEnv,
				value: parts.join('\n'),
				inline: true,
			});
		}

		await interaction.editReply({
			embeds: [embed],
			components: [createMessageActionRow([cancelButton, refreshButton])],
		});

		const collectedInteraction = await reply
			.awaitMessageComponent({
				filter: (collected) => collected.user.id === interaction.user.id,
				componentType: ComponentType.Button,
				time: 15000,
			})
			.catch(async () => {
				try {
					await interaction.editReply({
						content: i18next.t('command.common.errors.timed_out', { lng: locale }),
						components: [],
					});
				} catch (e) {
					const error = e as Error;
					logger.error(error, error.message);
				}
				return undefined;
			});

		if (collectedInteraction?.customId === cancelKey) {
			await collectedInteraction.update({
				content: i18next.t('command.utility.refresh_scamlist.cancel', {
					lng: locale,
				}),
				components: [],
			});
		}

		if (collectedInteraction?.customId === refreshKey) {
			let embed = addFields({
				color: Color.DiscordSuccess,
				title: i18next.t('command.utility.refresh_scamlist.success', {
					lng: locale,
				}),
			});

			try {
				const res = await refreshScamDomains();
				for (const result of res) {
					const parts = [
						i18next.t('command.utility.refresh_scamlist.before', {
							count: result.before,
							lng: locale,
						}),
						i18next.t('command.utility.refresh_scamlist.after', {
							count: result.after,
							lng: locale,
						}),
						i18next.t('command.utility.refresh_scamlist.last_change', {
							timestamp: result.lastRefresh
								? `<t:${Math.floor(result.lastRefresh / 1000)}:f> (<t:${Math.floor(result.lastRefresh / 1000)}:R>)`
								: i18next.t('command.utility.refresh_scamlist.refresh_never', { lng: locale }),
							lng: locale,
						}),
					];

					embed = addFields(embed, {
						name: result.envVar,
						value: parts.join('\n'),
						inline: true,
					});
				}
			} catch (err) {
				const error = err as Error;
				logger.error(error, error.message);
				embed = addFields({
					color: Color.DiscordDanger,
					title: i18next.t('command.utility.refresh_scamlist.error', {
						lng: locale,
					}),
				});
			}

			await collectedInteraction.update({ embeds: [embed], components: [] });
		}
	}
}

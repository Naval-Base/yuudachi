import { type CommandInteraction, type ButtonInteraction, Formatters, ButtonStyle, ComponentType } from 'discord.js';
import i18next from 'i18next';
import type { Redis } from 'ioredis';
import { nanoid } from 'nanoid';
import { container } from 'tsyringe';
import type { Command } from '../../Command';
import { refreshScamDomains, ScamRedisKeys, scamURLEnvs } from '../../functions/anti-scam/refreshScamDomains';
import { checkModRole } from '../../functions/permissions/checkModRole';
import type { RefreshScamlistCommand } from '../../interactions';
import type { ArgumentsOf } from '../../interactions/ArgumentsOf';
import { logger } from '../../logger';
import { kRedis } from '../../tokens';
import { awaitComponent } from '../../util/awaitComponent';
import { createButton } from '../../util/button';
import { addFields } from '../../util/embed';
import { createMessageActionRow } from '../../util/messageActionRow';

export default class implements Command {
	public async execute(
		interaction: CommandInteraction,
		_: ArgumentsOf<typeof RefreshScamlistCommand>,
		locale: string,
	): Promise<void> {
		const redis = container.resolve<Redis>(kRedis);

		const reply = await interaction.deferReply({ ephemeral: true, fetchReply: true });
		await checkModRole(interaction, locale);

		const missing = scamURLEnvs.filter((u) => !process.env[u]);

		if (missing.length) {
			logger.warn(`Missing environment variables: ${missing.join(', ')}.`);
		}

		if (missing.length === 2) {
			await interaction.editReply(i18next.t('command.utility.refresh_scamlist.missing_env', { lng: locale, missing }));
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
			label: i18next.t('command.utility.refresh_scamlist.buttons.cancel', { lng: locale }),
			style: ButtonStyle.Secondary,
		});

		let embed = addFields({
			color: 3092790,
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
					lng: locale,
					amount: Formatters.inlineCode(String(num)),
				}),

				i18next.t('command.utility.refresh_scamlist.last_change', {
					lng: locale,
					timestamp: lastRefresh
						? `<t:${Math.floor(parseInt(lastRefresh, 10) / 1000)}:f> (<t:${Math.floor(
								parseInt(lastRefresh, 10) / 1000,
						  )}:R>)`
						: i18next.t('command.utility.refresh_scamlist.refresh_never', { lng: locale }),
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

		const collectedInteraction = (await awaitComponent(interaction.client, reply, {
			filter: (collected) => collected.user.id === interaction.user.id,
			componentType: ComponentType.Button,
			time: 15000,
		}).catch(async () => {
			try {
				await interaction.editReply({
					content: i18next.t('common.errors.timed_out', { lng: locale }),
					components: [],
				});
			} catch (e) {
				const error = e as Error;
				logger.error(error, error.message);
			}
			return undefined;
		})) as ButtonInteraction<'cached'> | undefined;

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
				color: 5763719,
				title: i18next.t('command.utility.refresh_scamlist.success', {
					lng: locale,
				}),
			});

			try {
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
					color: 15548997,
					title: i18next.t('command.utility.refresh_scamlist.error', {
						lng: locale,
					}),
				});
			}

			await collectedInteraction.update({ embeds: [embed], components: [] });
		}
	}
}

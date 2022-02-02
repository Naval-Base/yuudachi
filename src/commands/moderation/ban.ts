import {
	type CommandInteraction,
	type ButtonInteraction,
	ActionRow,
	ButtonComponent,
	ButtonStyle,
	ComponentType,
} from 'discord.js';
import i18next from 'i18next';
import type { Redis } from 'ioredis';
import { nanoid } from 'nanoid';
import { inject, injectable } from 'tsyringe';
import type { Command } from '../../Command';
import { CaseAction, createCase } from '../../functions/cases/createCase';
import { generateCasePayload } from '../../functions/logs/generateCasePayload';
import { upsertCaseLog } from '../../functions/logs/upsertCaseLog';
import { checkModRole } from '../../functions/permissions/checkModRole';
import { checkLogChannel } from '../../functions/settings/checkLogChannel';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting';
import type { BanCommand } from '../../interactions';
import type { ArgumentsOf } from '../../interactions/ArgumentsOf';
import { logger } from '../../logger';
import { kRedis } from '../../tokens';
import { awaitComponent } from '../../util/awaitComponent';
import { generateHistory } from '../../util/generateHistory';

@injectable()
export default class implements Command {
	public constructor(@inject(kRedis) public readonly redis: Redis) {}

	public async execute(
		interaction: CommandInteraction<'cached'>,
		args: ArgumentsOf<typeof BanCommand>,
		locale: string,
	): Promise<void> {
		const reply = await interaction.deferReply({ ephemeral: true, fetchReply: true });
		await checkModRole(interaction, locale);

		const logChannel = await checkLogChannel(
			interaction.guild,
			(await getGuildSetting(interaction.guildId, SettingsKeys.ModLogChannelId)) as string,
		);
		if (!logChannel) {
			throw new Error(i18next.t('common.errors.no_mod_log_channel', { lng: locale }));
		}

		let alreadyBanned = false;
		try {
			await interaction.guild.bans.fetch(args.user.user.id);
			alreadyBanned = true;
		} catch {}

		if (alreadyBanned) {
			throw new Error(
				i18next.t('command.mod.ban.errors.already_banned', {
					user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
					lng: locale,
				}),
			);
		}

		if (args.user.member && !args.user.member.bannable) {
			throw new Error(
				i18next.t('command.mod.ban.errors.missing_permissions', {
					user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
					lng: locale,
				}),
			);
		}

		if (args.reason && args.reason.length >= 500) {
			throw new Error(i18next.t('command.mod.common.errors.max_length_reason', { lng: locale }));
		}

		const banKey = nanoid();
		const cancelKey = nanoid();

		const embed = await generateHistory(interaction, args.user, locale);

		const banButton = new ButtonComponent()
			.setCustomId(banKey)
			.setLabel(i18next.t('command.mod.ban.buttons.execute', { lng: locale }))
			.setStyle(ButtonStyle.Danger);
		const cancelButton = new ButtonComponent()
			.setCustomId(cancelKey)
			.setLabel(i18next.t('command.mod.ban.buttons.cancel', { lng: locale }))
			.setStyle(ButtonStyle.Secondary);

		await interaction.editReply({
			content: i18next.t('command.mod.ban.pending', {
				user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
				lng: locale,
			}),
			embeds: [embed],
			components: [new ActionRow().addComponents(cancelButton, banButton)],
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
				content: i18next.t('command.mod.ban.cancel', {
					user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
					lng: locale,
				}),
				components: [],
			});
		} else if (collectedInteraction?.customId === banKey) {
			await collectedInteraction.deferUpdate();

			// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
			await this.redis.setex(`guild:${collectedInteraction.guildId}:user:${args.user.user.id}:ban`, 15, '');
			const case_ = await createCase(
				collectedInteraction.guild,
				generateCasePayload({
					guildId: collectedInteraction.guildId,
					user: collectedInteraction.user,
					args: {
						...args,
						days: args.days ? Math.min(Math.max(Number(args.days), 0), 7) : 0,
					},
					action: CaseAction.Ban,
				}),
			);
			await upsertCaseLog(collectedInteraction.guildId, collectedInteraction.user, case_);

			await collectedInteraction.editReply({
				content: i18next.t('command.mod.ban.success', {
					user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
					lng: locale,
				}),
				components: [],
			});
		}
	}
}

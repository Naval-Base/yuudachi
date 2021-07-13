import {
	ButtonInteraction,
	CommandInteraction,
	Formatters,
	MessageActionRow,
	MessageButton,
	TextChannel,
} from 'discord.js';
import dayjs from 'dayjs';
import i18next from 'i18next';
import { ms } from '@naval-base/ms';
import { nanoid } from 'nanoid';

import { createLockdown } from '../../../../util/createLockdown';
import { logger } from '../../../../logger';

export async function lock(
	interaction: CommandInteraction,
	args: { channel: TextChannel; duration: string; reason?: string },
	locale: string,
): Promise<void> {
	const parsedDuration = ms(args.duration);
	if (parsedDuration < 300000 || isNaN(parsedDuration)) {
		throw new Error(i18next.t('command.common.errors.duration_format', { lng: locale }));
	}

	try {
		const lockKey = nanoid();
		const cancelKey = nanoid();

		const lockButton = new MessageButton()
			.setCustomId(lockKey)
			.setLabel(i18next.t('command.mod.lockdown.lock.buttons.execute', { lng: locale }))
			.setStyle('DANGER');
		const cancelButton = new MessageButton()
			.setCustomId(cancelKey)
			.setLabel(i18next.t('command.mod.lockdown.lock.buttons.cancel', { lng: locale }))
			.setStyle('SECONDARY');

		await interaction.editReply({
			content: i18next.t('command.mod.lockdown.lock.pending', {
				// eslint-disable-next-line @typescript-eslint/no-base-to-string
				channel: `${args.channel.toString()} - ${args.channel.name} (${args.channel.id})`,
				lng: locale,
			}),
			components: [new MessageActionRow().addComponents([cancelButton, lockButton])],
		});

		const collectedInteraction = await interaction.channel
			?.awaitMessageComponent<ButtonInteraction>({
				filter: (collected) => collected.user.id === interaction.user.id,
				componentType: 'BUTTON',
				time: 15000,
			})
			.catch(async () => {
				try {
					await interaction.editReply({
						content: i18next.t('command.common.errors.timed_out', { lng: locale }),
						components: [],
					});
				} catch {}
			});

		if (collectedInteraction?.customId === cancelKey) {
			await collectedInteraction.update({
				content: i18next.t('command.mod.lockdown.lock.cancel', {
					// eslint-disable-next-line @typescript-eslint/no-base-to-string
					channel: `${args.channel.toString()} - ${args.channel.name} (${args.channel.id})`,
					lng: locale,
				}),
				components: [],
			});
		} else if (collectedInteraction?.customId === lockKey) {
			await collectedInteraction.deferUpdate();

			const duration = new Date(Date.now() + parsedDuration);
			await createLockdown({
				guildId: args.channel.guildId,
				channelId: args.channel.id,
				channel: args.channel,
				expiration: duration,
				reason: args.reason,
				moderatorId: interaction.user.id,
				moderatorTag: interaction.user.tag,
			});

			await args.channel.send({
				content: i18next.t('command.mod.lockdown.lock.message', {
					duration: Formatters.time(dayjs(duration.toISOString()).unix(), Formatters.TimestampStyles.RelativeTime),
					lng: locale,
				}),
			});

			await collectedInteraction.editReply({
				content: i18next.t('command.mod.lockdown.lock.success', {
					// eslint-disable-next-line @typescript-eslint/no-base-to-string
					channel: `${args.channel.toString()} - ${args.channel.name} (${args.channel.id})`,
					lng: locale,
				}),
				components: [],
			});
		}
	} catch (e) {
		logger.error(e);
		throw new Error(
			i18next.t('command.mod.lockdown.lock.errors.failure', {
				// eslint-disable-next-line @typescript-eslint/no-base-to-string
				channel: `${args.channel.toString()} - ${args.channel.name} (${args.channel.id})`,
				lng: locale,
			}),
		);
	}
}

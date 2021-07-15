import { ButtonInteraction, CommandInteraction, MessageActionRow, MessageButton, TextChannel } from 'discord.js';
import i18next from 'i18next';
import { nanoid } from 'nanoid';

import { deleteLockdown } from '../../../../functions/lockdowns/deleteLockdown';

export async function lift(interaction: CommandInteraction, channel: TextChannel, locale: string): Promise<void> {
	const unlockKey = nanoid();
	const cancelKey = nanoid();

	const unlockButton = new MessageButton()
		.setCustomId(unlockKey)
		.setLabel(i18next.t('command.mod.lockdown.lift.buttons.execute', { lng: locale }))
		.setStyle('DANGER');
	const cancelButton = new MessageButton()
		.setCustomId(cancelKey)
		.setLabel(i18next.t('command.mod.lockdown.lift.buttons.cancel', { lng: locale }))
		.setStyle('SECONDARY');

	await interaction.editReply({
		content: i18next.t('command.mod.lockdown.lift.pending', {
			// eslint-disable-next-line @typescript-eslint/no-base-to-string
			channel: `${channel.toString()} - ${channel.name} (${channel.id})`,
			lng: locale,
		}),
		components: [new MessageActionRow().addComponents([cancelButton, unlockButton])],
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
					content: i18next.t('common.errors.timed_out', { lng: locale }),
					components: [],
				});
			} catch {}
		});

	if (collectedInteraction?.customId === cancelKey) {
		await collectedInteraction.update({
			content: i18next.t('command.mod.lockdown.lift.cancel', {
				// eslint-disable-next-line @typescript-eslint/no-base-to-string
				channel: `${channel.toString()} - ${channel.name} (${channel.id})`,
				lng: locale,
			}),
			components: [],
		});
	} else if (collectedInteraction?.customId === unlockKey) {
		await collectedInteraction.deferUpdate();

		await deleteLockdown(channel, locale);

		await collectedInteraction.editReply({
			content: i18next.t('command.mod.lockdown.lift.success', {
				// eslint-disable-next-line @typescript-eslint/no-base-to-string
				channel: `${channel.toString()} - ${channel.name} (${channel.id})`,
				lng: locale,
			}),
			components: [],
		});
	}
}

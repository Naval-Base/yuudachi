import type { APIMessage } from 'discord-api-types';
import {
	type CommandInteraction,
	type ButtonInteraction,
	type Message,
	ActionRow,
	ButtonComponent,
	type TextChannel,
	ButtonStyle,
	ComponentType,
} from 'discord.js';
import i18next from 'i18next';
import { nanoid } from 'nanoid';
import { deleteLockdown } from '../../../../functions/lockdowns/deleteLockdown';
import { getLockdown } from '../../../../functions/lockdowns/getLockdown';
import { awaitComponent } from '../../../../util/awaitComponent';

export async function lift(
	interaction: CommandInteraction<'cached'>,
	reply: Message | APIMessage,
	channel: TextChannel,
	locale: string,
): Promise<void> {
	const lockdown = await getLockdown(interaction.guildId, channel.id);
	if (!lockdown) {
		throw new Error(
			i18next.t('command.mod.lockdown.lock.errors.not_locked', {
				// eslint-disable-next-line @typescript-eslint/no-base-to-string
				channel: `${channel.toString()} - ${channel.name} (${channel.id})`,
				lng: locale,
			}),
		);
	}

	const unlockKey = nanoid();
	const cancelKey = nanoid();

	const unlockButton = new ButtonComponent()
		.setCustomId(unlockKey)
		.setLabel(i18next.t('command.mod.lockdown.lift.buttons.execute', { lng: locale }))
		.setStyle(ButtonStyle.Danger);
	const cancelButton = new ButtonComponent()
		.setCustomId(cancelKey)
		.setLabel(i18next.t('command.mod.lockdown.lift.buttons.cancel', { lng: locale }))
		.setStyle(ButtonStyle.Secondary);

	await interaction.editReply({
		content: i18next.t('command.mod.lockdown.lift.pending', {
			// eslint-disable-next-line @typescript-eslint/no-base-to-string
			channel: `${channel.toString()} - ${channel.name} (${channel.id})`,
			lng: locale,
		}),
		components: [new ActionRow().addComponents(cancelButton, unlockButton)],
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
		} catch {}
		return undefined;
	})) as ButtonInteraction<'cached'> | undefined;

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

		const lockdown = await deleteLockdown(channel.id);
		if (!lockdown) {
			throw new Error(
				i18next.t('command.mod.lockdown.lift.errors.failure', {
					// eslint-disable-next-line @typescript-eslint/no-base-to-string
					channel: `${channel.toString()} - ${channel.name} (${channel.id})`,
					lng: locale,
				}),
			);
		}

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

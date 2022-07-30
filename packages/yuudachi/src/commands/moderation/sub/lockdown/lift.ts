import {
	type CommandInteraction,
	type TextChannel,
	ButtonStyle,
	ComponentType,
	type InteractionResponse,
} from 'discord.js';
import i18next from 'i18next';
import { nanoid } from 'nanoid';
import { deleteLockdown } from '../../../../functions/lockdowns/deleteLockdown.js';
import { getLockdown } from '../../../../functions/lockdowns/getLockdown.js';
import { createButton } from '../../../../util/button.js';
import { createMessageActionRow } from '../../../../util/messageActionRow.js';

export async function lift(
	interaction: CommandInteraction<'cached'>,
	reply: InteractionResponse<true>,
	channel: TextChannel,
	locale: string,
): Promise<void> {
	const lockdown = await getLockdown(interaction.guildId, channel.id);

	if (!lockdown) {
		throw new Error(
			i18next.t('command.mod.lockdown.lift.errors.not_locked', {
				// eslint-disable-next-line @typescript-eslint/no-base-to-string
				channel: `${channel.toString()} - ${channel.name} (${channel.id})`,
				lng: locale,
			}),
		);
	}

	const unlockKey = nanoid();
	const cancelKey = nanoid();

	const unlockButton = createButton({
		customId: unlockKey,
		label: i18next.t('command.mod.lockdown.lift.buttons.execute', { lng: locale }),
		style: ButtonStyle.Danger,
	});
	const cancelButton = createButton({
		customId: cancelKey,
		label: i18next.t('command.common.buttons.cancel', { lng: locale }),
		style: ButtonStyle.Secondary,
	});

	await interaction.editReply({
		content: i18next.t('command.mod.lockdown.lift.pending', {
			// eslint-disable-next-line @typescript-eslint/no-base-to-string
			channel: `${channel.toString()} - ${channel.name} (${channel.id})`,
			lng: locale,
		}),
		components: [createMessageActionRow([cancelButton, unlockButton])],
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
			} catch {}
			return undefined;
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

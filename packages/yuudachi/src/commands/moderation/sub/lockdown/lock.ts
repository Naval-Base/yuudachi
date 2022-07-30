import { ms } from '@naval-base/ms';
import dayjs from 'dayjs';
import {
	type CommandInteraction,
	type TextChannel,
	ButtonStyle,
	ComponentType,
	type InteractionResponse,
	inlineCode,
	time,
	TimestampStyles,
} from 'discord.js';
import i18next from 'i18next';
import { nanoid } from 'nanoid';
import { createLockdown } from '../../../../functions/lockdowns/createLockdown.js';
import { getLockdown } from '../../../../functions/lockdowns/getLockdown.js';
import { createButton } from '../../../../util/button.js';
import { createMessageActionRow } from '../../../../util/messageActionRow.js';

interface LockdownLockArgs {
	channel: TextChannel;
	duration: string;
	reason?: string;
}

export async function lock(
	interaction: CommandInteraction<'cached'>,
	reply: InteractionResponse<true>,
	args: LockdownLockArgs,
	locale: string,
): Promise<void> {
	const lockdown = await getLockdown(interaction.guildId, args.channel.id);

	if (lockdown) {
		throw new Error(
			i18next.t('command.mod.lockdown.lock.errors.already_locked', {
				// eslint-disable-next-line @typescript-eslint/no-base-to-string
				channel: `${args.channel.toString()} - ${args.channel.name} (${args.channel.id})`,
				lng: locale,
			}),
		);
	}

	const parsedDuration = ms(args.duration);

	if (parsedDuration < 300000 || isNaN(parsedDuration)) {
		throw new Error(i18next.t('command.common.errors.duration_format', { lng: locale }));
	}

	const lockKey = nanoid();
	const cancelKey = nanoid();

	const lockButton = createButton({
		customId: lockKey,
		label: i18next.t('command.mod.lockdown.lock.buttons.execute', { lng: locale }),
		style: ButtonStyle.Danger,
	});
	const cancelButton = createButton({
		customId: cancelKey,
		label: i18next.t('command.common.buttons.cancel', { lng: locale }),
		style: ButtonStyle.Secondary,
	});

	await interaction.editReply({
		content: i18next.t('command.mod.lockdown.lock.pending', {
			// eslint-disable-next-line @typescript-eslint/no-base-to-string
			channel: `${args.channel.toString()} - ${args.channel.name} (${args.channel.id})`,
			lng: locale,
		}),
		components: [createMessageActionRow([cancelButton, lockButton])],
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
			content: args.reason
				? i18next.t('command.mod.lockdown.lock.message_reason', {
						duration: time(dayjs(duration.toISOString()).unix(), TimestampStyles.RelativeTime),
						reason: inlineCode(args.reason),
						lng: locale,
				  })
				: i18next.t('command.mod.lockdown.lock.message', {
						duration: time(dayjs(duration.toISOString()).unix(), TimestampStyles.RelativeTime),
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
}

import { ms } from '@naval-base/ms';
import { ButtonStyle, CommandInteraction, ComponentType } from 'discord.js';
import i18next from 'i18next';
import { nanoid } from 'nanoid';
import type { Command } from '../../Command.js';
import { fetchMessages, pruneMessages } from '../../functions/pruning/pruneMessages.js';
import type { ArgumentsOf } from '../../interactions/ArgumentsOf.js';
import type { ClearCommand } from '../../interactions/moderation/clear.js';
import { logger } from '../../logger.js';
import { createButton } from '../../util/button.js';
import { createMessageActionRow } from '../../util/messageActionRow.js';

export default class implements Command {
	public async execute(
		interaction: CommandInteraction<'cached'>,
		args: ArgumentsOf<typeof ClearCommand>,
		locale: string,
	): Promise<void> {
		const reply = await interaction.deferReply({ ephemeral: true, fetchReply: true });

		if (!/^\d{17,20}$/.test(args.last_message)) {
			throw new Error(
				i18next.t('command.common.errors.not_message_id', {
					val: args.last_message,
					arg: 'from',
					lng: locale,
				}),
			);
		}

		if (args.first_message && !/^\d{17,20}$/.test(args.first_message)) {
			throw new Error(
				i18next.t('command.common.errors.not_message_id', {
					val: args.first_message,
					arg: 'to',
					lng: locale,
				}),
			);
		}

		const firstMessage = await interaction.channel!.messages.fetch(args.last_message).catch(() => {
			throw new Error(
				i18next.t('command.mod.clear.errors.no_message', {
					message_id: args.last_message,
					// eslint-disable-next-line @typescript-eslint/no-base-to-string
					channel: interaction.channel!.toString(),
					lng: locale,
				}),
			);
		});
		const lastMessage = args.first_message
			? await interaction.channel!.messages.fetch(args.first_message).catch(() => {
					throw new Error(
						i18next.t('command.mod.clear.errors.no_message', {
							message_id: args.first_message,
							// eslint-disable-next-line @typescript-eslint/no-base-to-string
							channel: interaction.channel!.toString(),
							lng: locale,
						}),
					);
			  })
			: undefined;

		const messages = await fetchMessages(interaction.channel!, firstMessage, lastMessage);

		if (messages.size < 1) {
			throw new Error(
				i18next.t('command.mod.clear.errors.no_results', {
					lng: locale,
				}),
			);
		}

		const uniqueAuthors = new Set(messages.map((m) => m.author.id));
		const latest = messages.first()!;
		const earliest = messages.last()!;
		const delta = latest.createdTimestamp - earliest.createdTimestamp;

		const clearKey = nanoid();
		const cancelKey = nanoid();

		const clearButton = createButton({
			customId: clearKey,
			label: i18next.t('command.mod.clear.buttons.execute', { count: messages.size, lng: locale }),
			style: ButtonStyle.Danger,
		});
		const cancelButton = createButton({
			customId: cancelKey,
			label: i18next.t('command.common.buttons.cancel', { lng: locale }),
			style: ButtonStyle.Secondary,
		});

		await interaction.editReply({
			content: i18next.t('command.mod.clear.pending', {
				count: messages.size,
				author_count: uniqueAuthors.size,
				time: ms(delta, true),
				lng: locale,
			}),
			components: [createMessageActionRow([cancelButton, clearButton])],
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
				content: i18next.t('command.mod.clear.cancel', {
					lng: locale,
				}),
				components: [],
			});
		} else if (collectedInteraction?.customId === clearKey) {
			logger.info(`Pruning messages`, {
				amount: messages.size,
				timespan: ms(delta, true),
				unique_authors: uniqueAuthors.size,
			});

			await collectedInteraction.deferUpdate();
			const prunedMessages = await pruneMessages(interaction.channel!, messages);

			const prunedUniqueAuthors = new Set(messages.map((m) => m.author.id));
			const prunedLatest = messages.first()!;
			const prunedEarliest = messages.last()!;
			const prunedDelta = prunedLatest.createdTimestamp - prunedEarliest.createdTimestamp;

			await collectedInteraction.editReply({
				content: i18next.t('command.mod.clear.success', {
					count: prunedMessages.size,
					author_count: prunedUniqueAuthors.size,
					time: ms(prunedDelta, true),
					lng: locale,
				}),
				components: [],
			});
		}
	}
}

import { ComponentType } from 'discord.js';
import i18next from 'i18next';
import { nanoid } from 'nanoid';
import { AntiRaidNukeMode, handleAntiRaidNuke, validateMemberIds } from './coreCommand.js';
import type { InteractionParam, ArgsParam, LocaleParam } from '../../../../Command.js';
import type { AntiRaidNukeCommand } from '../../../../interactions/index.js';
import { logger } from '../../../../logger.js';
import { createModal } from '../../../../util/modal.js';
import { createModalActionRow } from '../../../../util/modalActionRow.js';
import { createTextComponent } from '../../../../util/textComponent.js';

export async function modal(
	interaction: InteractionParam,
	args: ArgsParam<typeof AntiRaidNukeCommand>['modal'],
	locale: LocaleParam,
): Promise<void> {
	const modalKey = nanoid();

	const textComponents = new Array(5).fill(0).map((_, i) =>
		createTextComponent({
			customId: `${modalKey}-${i}`,
			label: i18next.t('command.mod.anti_raid_nuke.modal.components.label', { i: i + 1, lng: locale }),
			minLength: 17,
			placeholder: i18next.t('command.mod.anti_raid_nuke.modal.components.placeholder', { lng: locale }),
			required: i === 0,
		}),
	);

	await interaction.showModal(
		createModal({
			customId: modalKey,
			title: i18next.t('command.mod.anti_raid_nuke.modal.title', { lng: locale }),
			components: textComponents.map((textComponent) => createModalActionRow([textComponent])),
		}),
	);

	const modalInteraction = await interaction
		.awaitModalSubmit({
			time: 120000,
			filter: (component) => component.customId === modalKey,
		})
		.catch(async () => {
			try {
				await interaction.followUp({
					content: i18next.t('command.common.errors.timed_out', { lng: locale }),
					ephemeral: true,
					components: [],
				});
			} catch (e) {
				const error = e as Error;
				logger.error(error, error.message);
			}
			return undefined;
		});

	if (!modalInteraction) {
		return;
	}

	await modalInteraction.deferReply({ ephemeral: args.hide ?? false });
	const fullContent = modalInteraction.components
		.map((row) => row.components)
		.flat()
		.map((component) => (component.type === ComponentType.TextInput ? component.value || '' : ''));

	const ids = new Set(fullContent.join(' ').match(/\d{17,20}/g) ?? []);
	const { validIdCount, totalIdCount, validMembers } = await validateMemberIds(modalInteraction, ids, locale);

	const parameterStrings = [
		i18next.t('command.mod.anti_raid_nuke.common.parameters.parsed_ids', {
			valid: validIdCount,
			total: totalIdCount,
			lng: locale,
		}),
	];

	await handleAntiRaidNuke(modalInteraction, validMembers, AntiRaidNukeMode.Modal, parameterStrings, args, locale);
}

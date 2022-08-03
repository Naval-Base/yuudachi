import { Buffer } from 'node:buffer';
import dayjs from 'dayjs';
import {
	type ButtonInteraction,
	ButtonStyle,
	Collection,
	ComponentType,
	type GuildMember,
	InteractionCollector,
	time,
	TimestampStyles,
} from 'discord.js';
import i18next from 'i18next';
import { nanoid } from 'nanoid';
import type { InteractionParam, ArgsParam, LocaleParam } from '../../../../Command.js';
import { DATE_FORMAT_LOGFILE } from '../../../../Constants.js';
import { blastOff } from '../../../../functions/anti-raid/blastOff.js';
import { formatMemberTimestamps } from '../../../../functions/anti-raid/formatMemberTimestamps.js';
import { insertAntiRaidNukeCaseLog } from '../../../../functions/logging/insertAntiRaidNukeCaseLog.js';
import { upsertAntiRaidNukeReport } from '../../../../functions/logging/upsertGeneralLog.js';
import type { AntiRaidNukeCommand } from '../../../../interactions/index.js';
import { logger } from '../../../../logger.js';
import { createButton } from '../../../../util/button.js';
import { createMessageActionRow } from '../../../../util/messageActionRow.js';
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

	await modalInteraction.deferReply({ ephemeral: args.hide ?? true });

	const fetchedMembers = await interaction.guild.members.fetch({ force: true });
	const fullContent = modalInteraction.components
		.map((row) => row.components)
		.flat()
		.map((component) => (component.type === ComponentType.TextInput ? component.value || '' : ''));

	const ids = fullContent.join(' ').match(/\d{17,20}/g) ?? [];

	if (!ids.length) {
		await modalInteraction.editReply({
			content: i18next.t('command.mod.anti_raid_nuke.modal.errors.no_ids', { lng: locale }),
		});
		return;
	}

	const members = new Collection<string, GuildMember>();
	const fails = new Set<string>();

	for (const id of ids) {
		const member = fetchedMembers.get(id);

		if (member) {
			members.set(id, member);
		} else {
			fails.add(id);
		}
	}

	if (!members.size) {
		throw new Error(i18next.t('command.mod.anti_raid_nuke.modal.errors.no_hits', { lng: locale }));
	}

	const parameterStrings = [
		i18next.t('command.mod.anti_raid_nuke.common.parameters.heading', { lng: locale }),
		i18next.t('command.mod.anti_raid_nuke.common.parameters.current_time', {
			now: time(dayjs().unix(), TimestampStyles.ShortDateTime),
			lng: locale,
		}),
		i18next.t('command.mod.anti_raid_nuke.common.parameters.days', {
			count: Math.min(Math.max(Number(args.days ?? 1), 0), 7),
			lng: locale,
		}),
	];

	if (fails.size) {
		parameterStrings.push(
			i18next.t('command.mod.anti_raid_nuke.modal.parameters.users', {
				count: fails.size,
				lng: locale,
			}),
		);
	}

	const banKey = nanoid();
	const cancelKey = nanoid();
	const dryRunKey = nanoid();

	const banButton = createButton({
		customId: banKey,
		label: i18next.t('command.mod.anti_raid_nuke.common.buttons.execute', { lng: locale }),
		style: ButtonStyle.Danger,
	});
	const cancelButton = createButton({
		customId: cancelKey,
		label: i18next.t('command.common.buttons.cancel', { lng: locale }),
		style: ButtonStyle.Secondary,
	});
	const dryRunButton = createButton({
		customId: dryRunKey,
		label: i18next.t('command.mod.anti_raid_nuke.common.buttons.dry_run', { lng: locale }),
		style: ButtonStyle.Primary,
	});

	const potentialHits = Buffer.from(members.map((member) => `${member.user.tag} (${member.id})`).join('\n'));
	const potentialHitsDate = dayjs().format(DATE_FORMAT_LOGFILE);

	const { creationRange, joinRange } = formatMemberTimestamps(members);

	await modalInteraction.editReply({
		content: `${i18next.t('command.mod.anti_raid_nuke.common.pending', {
			count: members.size,
			creation_range: creationRange,
			join_range: joinRange,
			lng: locale,
		})}\n\n${parameterStrings.join('\n')}`,
		files: [{ name: `${potentialHitsDate}-anti-raid-nuke-list.txt`, attachment: potentialHits }],
		components: [createMessageActionRow([cancelButton, banButton, dryRunButton])],
	});

	const collectedInteraction = await new Promise<ButtonInteraction<'cached'>>((resolve, reject) => {
		const collector = new InteractionCollector<ButtonInteraction<'cached'>>(modalInteraction.client, {
			time: 180000,
			filter: (component) => component.user.id === modalInteraction.user.id,
			channel: modalInteraction.channel!,
			componentType: ComponentType.Button,
			message: modalInteraction.message,
		});

		collector.on('collect', (interaction) => {
			resolve(interaction);
			collector.stop('collected');
		});

		collector.on('end', (_, reason) => {
			if (reason === 'collected') {
				return;
			}
			reject(reason);
		});
	}).catch(async () => {
		try {
			await modalInteraction.editReply({
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
			content: i18next.t('command.mod.anti_raid_nuke.common.cancel', {
				lng: locale,
			}),
			components: [],
		});
	} else if (collectedInteraction?.customId === banKey || collectedInteraction?.customId === dryRunKey) {
		const dryRunMode = collectedInteraction.customId === dryRunKey;

		const content =
			collectedInteraction.message.content +
			(dryRunMode ? `\n\n${i18next.t('command.mod.anti_raid_nuke.common.parameters.dry_run', { lng: locale })}` : '');

		await collectedInteraction.update({
			content,
			components: [
				createMessageActionRow([
					{ ...cancelButton, disabled: true },
					{ ...banButton, disabled: true },
				]),
			],
		});

		const { result, cases } = await blastOff(
			collectedInteraction,
			{
				days: Math.min(Math.max(Number(args.days ?? 1), 0), 7),
				dryRun: dryRunMode,
			},
			members,
			locale,
		);

		if (!dryRunMode && cases.length) {
			await insertAntiRaidNukeCaseLog(
				collectedInteraction.guild,
				collectedInteraction.user,
				cases,
				args.reason ??
					i18next.t('command.mod.anti_raid_nuke.common.success', {
						count: result.filter((r) => r.success).length,
						lng: locale,
					}),
			);
		}

		const membersHit = Buffer.from(
			result
				.map(
					(r) =>
						`${r.member.user.id.padEnd(19, ' ')} | Join: ${dayjs(r.member.joinedTimestamp).format(
							DATE_FORMAT_LOGFILE,
						)} | Creation: ${dayjs(r.member.user.createdTimestamp).format(DATE_FORMAT_LOGFILE)} | ${r.member.user.tag}`,
				)
				.join('\n'),
		);
		const membersHitDate = dayjs().format(DATE_FORMAT_LOGFILE);

		await upsertAntiRaidNukeReport(collectedInteraction.guild, collectedInteraction.user, result);

		await collectedInteraction.editReply({
			content: i18next.t('command.mod.anti_raid_nuke.common.success', {
				count: result.filter((r) => r.success).length,
				lng: locale,
			}),
			files: [{ name: `${membersHitDate}-anti-raid-nuke-hits.txt`, attachment: membersHit }],
			components: [],
		});
	}
}

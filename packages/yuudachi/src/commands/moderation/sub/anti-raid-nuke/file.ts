import dayjs from 'dayjs';
import {
	Attachment,
	ButtonStyle,
	Collection,
	CommandInteraction,
	ComponentType,
	Formatters,
	GuildMember,
	TextChannel,
} from 'discord.js';
import i18next from 'i18next';
import { nanoid } from 'nanoid';
import fetch from 'node-fetch';
import { DATE_FORMAT_LOGFILE } from '../../../../Constants.js';
import executeNuke from '../../../../functions/anti-raid/executeNuke.js';
import { formatMemberTimestamps } from '../../../../functions/anti-raid/formatMemberTimestamps.js';
import { insertAntiRaidNukeCaseLog } from '../../../../functions/logging/insertAntiRaidNukeCaseLog.js';
import { upsertAntiRaidNukeReport } from '../../../../functions/logging/upsertGeneralLog.js';
import { logger } from '../../../../logger.js';
import { createButton } from '../../../../util/button.js';
import { createMessageActionRow } from '../../../../util/messageActionRow.js';

export interface AntiRaidFileArgs {
	file: Attachment;
	reason?: string | undefined;
	days?: number | undefined;
	hide?: boolean | undefined;
}

async function parseFile(file: Attachment): Promise<Set<string>> {
	const content = await fetch(file.url).then((res) => res.text());

	const ids: string[] | null = content.match(/\d{17,20}/g);

	if (!ids?.length) {
		return new Set();
	}

	return new Set(ids);
}

export async function file(
	interaction: CommandInteraction<'cached'>,
	data: AntiRaidFileArgs,
	logChannel: TextChannel,
	ignoreRolesId: string[],
	locale: string,
): Promise<void> {
	const reply = await interaction.deferReply({ ephemeral: data.hide ?? true });

	const file = data.file;
	const ids = await parseFile(file);

	if (!ids.size) {
		throw new Error(i18next.t('command.mod.anti_raid_nuke.errors.no_ids', { lng: locale }));
	}

	const { reason, days } = {
		reason: data.reason ?? null,
		days: data.days ?? 1,
	};

	const fetchedMembers = await interaction.guild.members.fetch();
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
		throw new Error(i18next.t('command.mod.anti_raid_nuke.errors.no_hits_file', { lng: locale }));
	}

	const parameterStrings = [
		i18next.t('command.mod.anti_raid_nuke.parameters.heading', { lng: locale }),
		i18next.t('command.mod.anti_raid_nuke.parameters.current_time', {
			lng: locale,
			now: Formatters.time(dayjs().unix(), Formatters.TimestampStyles.ShortDateTime),
		}),
		i18next.t('command.mod.anti_raid_nuke.parameters.file', {
			lng: locale,
			file: Formatters.hyperlink('File uploaded', file.url),
		}),
	];

	if (fails.size) {
		parameterStrings.push(
			i18next.t('command.mod.anti_raid_nuke.parameters.users', {
				lng: locale,
				users: Formatters.inlineCode(fails.size.toString()),
			}),
		);
	}

	const banKey = nanoid();
	const cancelKey = nanoid();
	const dryRunKey = nanoid();

	const banButton = createButton({
		customId: banKey,
		label: i18next.t('command.mod.anti_raid_nuke.buttons.execute', { lng: locale }),
		style: ButtonStyle.Danger,
	});
	const cancelButton = createButton({
		customId: cancelKey,
		label: i18next.t('command.mod.anti_raid_nuke.buttons.cancel', { lng: locale }),
		style: ButtonStyle.Secondary,
	});
	const dryRunButton = createButton({
		customId: dryRunKey,
		label: i18next.t('command.mod.anti_raid_nuke.buttons.dry_run', { lng: locale }),
		style: ButtonStyle.Primary,
	});

	const potentialHits = Buffer.from(members.map((member) => `${member.user.tag} (${member.id})`).join('\n'));
	const potentialHitsDate = dayjs().format(DATE_FORMAT_LOGFILE);

	const { creationRange, joinRange } = formatMemberTimestamps(members);

	await interaction.editReply({
		content: `${i18next.t('command.mod.anti_raid_nuke.pending', {
			members: members.size,
			creationRange,
			joinRange,
			lng: locale,
		})}\n\n${parameterStrings.join('\n')}`,
		files: [{ name: `${potentialHitsDate}-anti-raid-nuke-list.txt`, attachment: potentialHits }],
		components: [createMessageActionRow([cancelButton, banButton, dryRunButton])],
	});

	const collectedInteraction = await reply
		.awaitMessageComponent({
			filter: (collected) => collected.user.id === interaction.user.id,
			componentType: ComponentType.Button,
			time: 60000,
		})
		.catch(async () => {
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
		});

	if (collectedInteraction?.customId === cancelKey) {
		await collectedInteraction.update({
			content: i18next.t('command.mod.anti_raid_nuke.cancel', {
				lng: locale,
			}),
			components: [],
			attachments: [],
		});
	} else if (collectedInteraction?.customId === banKey || collectedInteraction?.customId === dryRunKey) {
		const dryRunMode = collectedInteraction.customId === dryRunKey;

		const content =
			collectedInteraction.message.content +
			(dryRunMode ? `\n\n${i18next.t('command.mod.anti_raid_nuke.parameters.dry_run', { lng: locale })}` : '');

		await collectedInteraction.update({
			content,
			components: [],
		});

		const { result, cases } = await executeNuke(
			collectedInteraction,
			{
				days,
				dryRun: dryRunMode,
			},
			members,
			ignoreRolesId,
			locale,
		);

		if (!dryRunMode && cases.length > 0) {
			await insertAntiRaidNukeCaseLog(
				collectedInteraction.guild,
				collectedInteraction.user,
				logChannel,
				cases,
				reason ??
					i18next.t('command.mod.anti_raid_nuke.success', {
						lng: locale,
						members: result.filter((r) => r.success).length,
					}),
			);
		}

		const membersHit = Buffer.from(
			result
				.map(
					(r) =>
						`${r.member.user.id} | Join: ${dayjs(r.member.joinedTimestamp).format(
							DATE_FORMAT_LOGFILE,
						)} | Creation: ${dayjs(r.member.user.createdTimestamp).format(DATE_FORMAT_LOGFILE)} | ${r.member.user.tag}`,
				)
				.join('\n'),
		);
		const membersHitDate = dayjs().format(DATE_FORMAT_LOGFILE);

		await upsertAntiRaidNukeReport(
			collectedInteraction.guild.id,
			collectedInteraction.user,
			collectedInteraction.channel as TextChannel,
			result,
		);

		await collectedInteraction.editReply({
			content: i18next.t('command.mod.anti_raid_nuke.success', {
				members: result.filter((r) => r.success).length,
				lng: locale,
			}),
			files: [{ name: `${membersHitDate}-anti-raid-nuke-hits.txt`, attachment: membersHit }],
		});
	}
}

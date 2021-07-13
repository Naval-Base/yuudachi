import {
	ButtonInteraction,
	CommandInteraction,
	Formatters,
	GuildMember,
	MessageActionRow,
	MessageButton,
} from 'discord.js';
import i18next from 'i18next';
import { ms } from '@naval-base/ms';
import { nanoid } from 'nanoid';
import dayjs from 'dayjs';

import type { ArgumentsOf } from '../../interactions/ArgumentsOf';
import type { Command } from '../../Command';
import type { AntiRaidNukeCommand } from '../../interactions';
import { CaseAction, createCase } from '../../util/createCase';
import { upsertCaseLog } from '../../util/upsertCaseLog';
import { generateCasePayload } from '../../util/generateCasePayload';
import { checkModRole } from '../../util/checkModRole';
import { DATE_FORMAT_LOGFILE } from '../../Constants';
import { logger } from '../../logger';

export default class implements Command {
	public async execute(
		interaction: CommandInteraction,
		args: ArgumentsOf<typeof AntiRaidNukeCommand>,
		locale: string,
	): Promise<void> {
		await interaction.defer();
		await checkModRole(interaction, locale);

		const parsedJoin = ms(args.join);
		if (parsedJoin < 6000 || parsedJoin > 120 * 60 * 1000 || isNaN(parsedJoin)) {
			throw new Error(i18next.t('command.common.errors.duration_format', { lng: locale }));
		}

		const parsedAge = ms(args.age);
		if (parsedAge < 6000 || isNaN(parsedAge)) {
			throw new Error(i18next.t('command.common.errors.duration_format', { lng: locale }));
		}

		const joinCutoff = Date.now() - parsedJoin;
		const ageCutoff = Date.now() - parsedAge;

		const fetchedMembers = await interaction.guild?.members.fetch({ force: true });
		const members = fetchedMembers?.filter(
			(member) => member.joinedTimestamp! > joinCutoff && member.user.createdTimestamp > ageCutoff,
		);

		if (!members?.size) {
			await interaction.editReply({
				content: `${i18next.t('command.mod.anti_raid_nuke.errors.no_hits', {
					lng: locale,
				})}\n\n${i18next.t('command.mod.anti_raid_nuke.errors.parameters', {
					now: Formatters.time(dayjs().unix(), Formatters.TimestampStyles.ShortDateTime),
					join: Formatters.time(dayjs(joinCutoff).unix(), Formatters.TimestampStyles.ShortDateTime),
					age: Formatters.time(dayjs(ageCutoff).unix(), Formatters.TimestampStyles.ShortDateTime),
					lng: locale,
				})}`,
			});
			return;
		}

		try {
			const banKey = nanoid();
			const cancelKey = nanoid();

			const banButton = new MessageButton()
				.setCustomId(banKey)
				.setLabel(i18next.t('command.mod.anti_raid_nuke.buttons.execute', { lng: locale }))
				.setStyle('DANGER');
			const cancelButton = new MessageButton()
				.setCustomId(cancelKey)
				.setLabel(i18next.t('command.mod.anti_raid_nuke.buttons.cancel', { lng: locale }))
				.setStyle('SECONDARY');

			const potentialHits = Buffer.from(members.map((member) => `${member.user.tag} (${member.user.id})`).join('\r\n'));
			const potentialHitsDate = dayjs().format(DATE_FORMAT_LOGFILE);

			await interaction.editReply({
				content: `${i18next.t('command.mod.anti_raid_nuke.pending', {
					members: members.size,
					lng: locale,
				})}\n\n${i18next.t('command.mod.anti_raid_nuke.errors.parameters', {
					now: Formatters.time(dayjs().unix(), Formatters.TimestampStyles.ShortDateTime),
					join: Formatters.time(dayjs(joinCutoff).unix(), Formatters.TimestampStyles.ShortDateTime),
					age: Formatters.time(dayjs(ageCutoff).unix(), Formatters.TimestampStyles.ShortDateTime),
					lng: locale,
				})}`,
				files: [{ name: `${potentialHitsDate}-anti-raid-nuke-list.txt`, attachment: potentialHits }],
				components: [new MessageActionRow().addComponents([cancelButton, banButton])],
			});

			const collectedInteraction = await interaction.channel
				?.awaitMessageComponent<ButtonInteraction>({
					filter: (collected) => collected.user.id === interaction.user.id,
					componentType: 'BUTTON',
					time: 60000,
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
					content: i18next.t('command.mod.anti_raid_nuke.cancel', {
						lng: locale,
					}),
					components: [],
					// @ts-expect-error
					attachments: [],
				});
			} else if (collectedInteraction?.customId === banKey) {
				await collectedInteraction.deferUpdate();

				let idx = 0;
				const promises = [];
				const fatalities: GuildMember[] = [];
				const survivors: GuildMember[] = [];
				for (const member of members.values()) {
					promises.push(
						createCase(
							interaction,
							generateCasePayload(
								interaction,
								{
									reason: `Anti-raid-nuke \`(${++idx}/${members.size})\``,
									user: {
										member: member,
										user: member.user,
									},
									// @ts-expect-error
									days: args.days ? Math.min(Math.max(Number(args.days), 0), 7) : 0,
								},
								CaseAction.Ban,
							),
						)
							.then((case_) => upsertCaseLog(interaction, case_))
							.then(() => fatalities.push(member))
							.catch(() => survivors.push(member)),
					);
				}

				for (const promise of promises) {
					await promise;
				}

				const membersHit = Buffer.from(fatalities.map((member) => member.user.id).join('\r\n'));
				const membersHitDate = dayjs().format(DATE_FORMAT_LOGFILE);

				await collectedInteraction.editReply({
					content: i18next.t('command.mod.anti_raid_nuke.success', {
						members: fatalities.length,
						lng: locale,
					}),
					files: [{ name: `${membersHitDate}-anti-raid-nuke-report.txt`, attachment: membersHit }],
					components: [],
				});
			}
		} catch (e) {
			logger.error(e);
			throw new Error(
				i18next.t('command.mod.anti_raid_nuke.errors.failure', {
					lng: locale,
				}),
			);
		}
	}
}

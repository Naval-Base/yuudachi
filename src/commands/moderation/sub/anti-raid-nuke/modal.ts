import { performance } from 'perf_hooks';
import { ms } from '@naval-base/ms';
import dayjs from 'dayjs';
import {
	ButtonInteraction,
	ButtonStyle,
	Collection,
	CommandInteraction,
	ComponentType,
	Formatters,
	GuildMember,
	InteractionCollector,
	TextBasedChannelResolvable,
	TextChannel,
	TextInputStyle,
} from 'discord.js';
import i18next from 'i18next';
import type { Redis } from 'ioredis';
import { nanoid } from 'nanoid';
import { DATE_FORMAT_LOGFILE } from '../../../../Constants.js';
import { checkBan } from '../../../../functions/anti-raid/checkBan.js';
import { AntiRaidNukeModes, generateReportTargetInfo, reportSort } from '../../../../functions/anti-raid/formatReport.js';
import { Case, CaseAction, createCase } from '../../../../functions/cases/createCase.js';
import { getCaseId } from '../../../../functions/cases/getCaseId.js';
import { generateCasePayload } from '../../../../functions/logging/generateCasePayload.js';
import { insertAntiRaidNukeCaseLog } from '../../../../functions/logging/insertAntiRaidNukeCaseLog.js';
import { upsertAntiRaidNukeReport } from '../../../../functions/logging/upsertGeneralLog.js';
import { logger } from '../../../../logger.js';
import { createButton } from '../../../../util/button.js';
import { generateTargetInformation } from '../../../../util/generateTargetInformation.js';
import { createMessageActionRow } from '../../../../util/messageActionRow.js';
import { createModal, createTextComponent } from '../../../../util/modal.js';
import type { AntiRaidResult } from '../../anti-raid-nuke.js';

export interface AntiRaidModalArgs {
	reason?: string | undefined;
	days?: number | undefined;
	hide?: boolean | undefined;
}

export async function modal(
	interaction: CommandInteraction<'cached'>,
	data: AntiRaidModalArgs,
	logChannel: TextChannel,
	ignoreRolesId: string[],
	locale: string,
	redis: Redis,
): Promise<void> {
	const start = performance.now();

	const { reason, days } = {
		reason: data.reason ?? null,
		days: data.days ?? 1,
	};

	const modalKey = nanoid();

	const textComponents = new Array(5)
		.fill(0)
		.map((_, i) =>
			createTextComponent(
				`${modalKey}-${i}`,
				i18next.t('command.mod.anti_raid_nuke.modal.components.label', { lng: locale, i: i + 1 }),
				TextInputStyle.Paragraph,
				undefined,
				17,
				i18next.t('command.mod.anti_raid_nuke.modal.components.placeholder', { lng: locale }),
				i === 0,
			),
		);

	await interaction.showModal(
		createModal(i18next.t('command.mod.anti_raid_nuke.modal.title', { lng: locale }), modalKey, textComponents),
	);

	const modalInteraction = await interaction
		.awaitModalSubmit({
			time: 120000,
			filter: (component) => component.customId === modalKey,
		})
		.catch(async () => {
			try {
				await interaction.followUp({
					content: i18next.t('common.errors.timed_out', { lng: locale }),
					components: [],
					ephemeral: true,
				});
			} catch (e) {
				const error = e as Error;
				logger.error(error, error.message);
			}
			return undefined;
		});

	if (!modalInteraction) return;

	const reply = await modalInteraction.deferReply({ ephemeral: data.hide ?? true });

	console.log(reply);

	const fetchedMembers = await interaction.guild.members.fetch();
	const fullContent = modalInteraction.components
		.map((row) => row.components)
		.flat()
		// @ts-expect-error
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		.map((component) => component.value || '') as string[];

	const ids = fullContent.join(' ').match(/\d{17,20}/g) ?? [];

	if (!ids.length) {
		await modalInteraction.editReply({
			content: i18next.t('command.mod.anti_raid_nuke.errors.no_ids', { lng: locale }),
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
		throw new Error(i18next.t('command.mod.anti_raid_nuke.errors.no_hits_file', { lng: locale }));
	}

	const parameterStrings = [
		i18next.t('command.mod.anti_raid_nuke.parameters.heading', { lng: locale }),
		i18next.t('command.mod.anti_raid_nuke.parameters.current_time', {
			lng: locale,
			now: Formatters.time(dayjs().unix(), Formatters.TimestampStyles.ShortDateTime),
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

	const potentialHits = Buffer.from(members.map((member) => generateTargetInformation(member)).join('\r\n'));
	const potentialHitsDate = dayjs().format(DATE_FORMAT_LOGFILE);

	let creationLower = Number.POSITIVE_INFINITY;
	let creationUpper = Number.NEGATIVE_INFINITY;
	let joinLower = Number.POSITIVE_INFINITY;
	let joinUpper = Number.NEGATIVE_INFINITY;

	for (const member of members.values()) {
		if (member.joinedTimestamp) {
			joinLower = Math.min(member.joinedTimestamp, joinLower);
			joinUpper = Math.max(member.joinedTimestamp, joinUpper);
		}
		creationLower = Math.min(member.user.createdTimestamp, creationLower);
		creationUpper = Math.max(member.user.createdTimestamp, creationUpper);
	}

	const creationrange = ms(creationUpper - creationLower, true);
	const joinrange = ms(joinUpper - joinLower, true);

	await modalInteraction.editReply({
		content: `${i18next.t('command.mod.anti_raid_nuke.pending', {
			members: members.size,
			creationrange,
			joinrange,
			lng: locale,
		})}\n\n${parameterStrings.join('\n')}`,
		files: [{ name: `${potentialHitsDate}-anti-raid-nuke-list.txt`, attachment: potentialHits }],
		components: [createMessageActionRow([cancelButton, banButton, dryRunButton])],
	});

	const collectedInteraction = await new Promise<ButtonInteraction<'cached'>>((resolve, reject) => {
		const collector = new InteractionCollector<ButtonInteraction<'cached'>>(modalInteraction.client, {
			time: 120000,
			filter: (component) => component.user.id === modalInteraction.user.id,
			channel: modalInteraction.channel as TextBasedChannelResolvable,
			componentType: ComponentType.Button,
			message: modalInteraction.message,
		})

		collector.on('collect', (interaction) => {
			resolve(interaction);
			collector.stop('collected');
		})

		collector.on('end', (_, reason) => {
			if (reason === 'collected') return;
			reject(reason);
		})
	}).catch(async () => {
		try {
			await modalInteraction.editReply({
				content: i18next.t('common.errors.timed_out', { lng: locale }),
				components: [],
			});
		} catch (e) {
			const error = e as Error;
			logger.error(error, error.message);
		}
		return undefined;
	});

	console.log(collectedInteraction);

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

		const content = collectedInteraction.message.content + (dryRunMode ? (`\n\n${i18next.t('command.mod.anti_raid_nuke.parameters.dry_run', { lng: locale })}`) : '');

		await collectedInteraction.update({
			content,
			components: [
				createMessageActionRow([
					{ ...cancelButton, disabled: true },
					{ ...banButton, disabled: true },
					{ ...dryRunButton, disabled: true },
				]),
			],
		});

		await redis.setex(`guild:${collectedInteraction.guildId}:anti_raid_nuke`, 15, 'true');
		let idx = 0;
		const promises = [];

		const result: AntiRaidResult[] = [];
		const caseIdKey = `anti_raid_nuke_${nanoid()}`;

		await redis.setex(caseIdKey, 15, (await getCaseId(interaction.guildId)));

		for (const member of members.values()) {
			promises.push(
				(async () => {
					const reason = i18next.t('command.mod.anti_raid_nuke.reason', {
						current: ++idx,
						members: members.size,
						lng: locale,
					});

					const authorization = checkBan(member, interaction.user.id, ignoreRolesId);

					if (authorization) {
						result.push({
							member,
							success: false,
							error: i18next.t(`command.mod.anti_raid_nuke.errors.result.${authorization}`, { lng: locale }),
						});
						return;
					}

					const ban = dryRunMode ? true : await member.ban({ reason, deleteMessageDays: days }).catch((err) => {
						const error = err as Error;
						
						result.push({
							member,
							success: false,
							error: i18next.t('command.mod.anti_raid_nuke.errors.result.ban_failed', { lng: locale, error: error.message }),
						});
						return false;
					});

					if (!ban) {
						return;
					}

					const case_ = await createCase(
						collectedInteraction.guild,
						generateCasePayload({
							guildId: collectedInteraction.guildId,
							user: collectedInteraction.user,
							args: {
								reason,
								user: {
									member: member,
									user: member.user,
								},
								days: days,
							},
							action: CaseAction.Ban,
							caseId: await redis.incr(caseIdKey),
							multi: true,
						}),
						true,
					).catch((err) => {
						const error = err as Error;
						
						result.push({
							member,
							success: false,
							error: i18next.t('command.mod.anti_raid_nuke.errors.result.case_failed', { lng: locale, error: error.message }),
						});
						return false;
					});

					if (!case_) {
						return;
					}

					await redis.expire(`guild:${collectedInteraction.guildId}:anti_raid_nuke`, 15);
					await redis.expire(caseIdKey, 15);

					result.push({
						member,
						success: true,
						caseId: (case_ as Case).caseId,
						error: undefined,
					});

					return case_;
				})(),
			);
		}

		const resolvedCases = await Promise.all(promises);
		const cases = resolvedCases.filter(Boolean) as Case[];
		await redis.expire(`guild:${collectedInteraction.guildId}:anti_raid_nuke`, 5);
		await redis.expire(caseIdKey, 5);

		if (cases.length > 0) {
			console.log(cases);

			await insertAntiRaidNukeCaseLog(
				collectedInteraction.guild,
				collectedInteraction.user,
				logChannel,
				cases,
				reason ?? i18next.t('command.mod.anti_raid_nuke.success', { lng: locale, members: result.filter((r) => r.success).length }),
			);
		}

		const end = performance.now();

		const membersHit = Buffer.from(
			result
				.sort(reportSort)
				.map((r) => generateReportTargetInfo(r))
				.join('\n'),
		);
		const membersHitDate = dayjs().format(DATE_FORMAT_LOGFILE);

		const message = await upsertAntiRaidNukeReport(
			collectedInteraction.guild.id,
			collectedInteraction.user,
			collectedInteraction.channel as TextChannel,
			result,
			{
				mode: AntiRaidNukeModes.Modal,
				time: end - start,
				cases,
				logChannel,
				dryRun: dryRunMode,
				...data,
			},
		);

		const attachment = message!.attachments.first();

		await collectedInteraction.editReply({
			content: i18next.t('command.mod.anti_raid_nuke.success', {
				members: result.filter((r) => r.success).length,
				lng: locale,
			}),
			files: [{ name: `${membersHitDate}-anti-raid-nuke-hits.ansi`, attachment: membersHit }],
			components: [
				createMessageActionRow([
					{
						type: ComponentType.Button,
						style: ButtonStyle.Link,
						url: `${process.env.REPORT_FORMATER_URL!}${attachment!.url}`,
						label: i18next.t('command.mod.anti_raid_nuke.buttons.report', { lng: locale }),
					},
				]),
			],
		});
	}
}

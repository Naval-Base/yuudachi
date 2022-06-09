import { ms } from '@naval-base/ms';
import dayjs from 'dayjs';
import { type CommandInteraction, Formatters, type GuildMember, ButtonStyle, ComponentType } from 'discord.js';
import i18next from 'i18next';
import type { Redis } from 'ioredis';
import { nanoid } from 'nanoid';
import RE2 from 're2';
import { inject, injectable } from 'tsyringe';
import type { Command } from '../../Command.js';
import { DATE_FORMAT_LOGFILE } from '../../Constants.js';
import { type Case, CaseAction, createCase } from '../../functions/cases/createCase.js';
import { generateCasePayload } from '../../functions/logging/generateCasePayload.js';
import { insertAntiRaidNukeCaseLog } from '../../functions/logging/insertAntiRaidNukeCaseLog.js';
import { checkLogChannel } from '../../functions/settings/checkLogChannel.js';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting.js';
import type { ArgumentsOf } from '../../interactions/ArgumentsOf.js';
import type { AntiRaidNukeCommand } from '../../interactions/index.js';
import { logger } from '../../logger.js';
import { kRedis } from '../../tokens.js';
import { createButton } from '../../util/button.js';
import { generateTargetInformation } from '../../util/generateTargetInformation.js';
import { createMessageActionRow } from '../../util/messageActionRow.js';

@injectable()
export default class implements Command {
	public constructor(@inject(kRedis) public readonly redis: Redis) {}

	public async execute(
		interaction: CommandInteraction<'cached'>,
		args: ArgumentsOf<typeof AntiRaidNukeCommand>,
		locale: string,
	): Promise<void> {
		const reply = await interaction.deferReply();
		const logChannel = await checkLogChannel(
			interaction.guild,
			(await getGuildSetting(interaction.guildId, SettingsKeys.ModLogChannelId)) as string,
		);
		if (!logChannel) {
			throw new Error(i18next.t('common.errors.no_mod_log_channel', { lng: locale }));
		}

		const parsedJoin = ms(args.join);
		if (parsedJoin < 6000 || isNaN(parsedJoin)) {
			throw new Error(i18next.t('command.common.errors.duration_format', { lng: locale }));
		}

		const parsedAge = ms(args.age);
		if (parsedAge < 6000 || isNaN(parsedAge)) {
			throw new Error(i18next.t('command.common.errors.duration_format', { lng: locale }));
		}

		if (args.reason && args.reason.length >= 500) {
			throw new Error(i18next.t('command.mod.common.errors.max_length_reason', { lng: locale }));
		}

		const joinCutoff = Date.now() - parsedJoin;
		const accountCutoff = Date.now() - parsedAge;

		const fetchedMembers = await interaction.guild.members.fetch({ force: true });
		const members = fetchedMembers.filter((member) => {
			if (args.pattern) {
				try {
					const re = new RE2(`^${args.pattern}$`, 'i');
					if (!re.test(member.user.username)) {
						return false;
					}
				} catch {}
			}

			if (args.avatar) {
				if (member.avatar !== args.avatar && member.user.avatar !== args.avatar) {
					return false;
				}
			}

			return member.joinedTimestamp! > joinCutoff && member.user.createdTimestamp > accountCutoff;
		});

		const parameterStrings = [
			i18next.t('command.mod.anti_raid_nuke.errors.parameters.heading', {
				lng: locale,
			}),
			i18next.t('command.mod.anti_raid_nuke.errors.parameters.current_time', {
				lng: locale,
				now: Formatters.time(dayjs().unix(), Formatters.TimestampStyles.ShortDateTime),
			}),
			i18next.t('command.mod.anti_raid_nuke.errors.parameters.join_after', {
				lng: locale,
				join: Formatters.time(dayjs(joinCutoff).unix(), Formatters.TimestampStyles.ShortDateTime),
			}),
			i18next.t('command.mod.anti_raid_nuke.errors.parameters.created_after', {
				lng: locale,
				age: Formatters.time(dayjs(accountCutoff).unix(), Formatters.TimestampStyles.ShortDateTime),
			}),
		];

		if (args.avatar) {
			parameterStrings.push(
				i18next.t('command.mod.anti_raid_nuke.errors.parameters.avatar', {
					avatar: Formatters.inlineCode(args.avatar),
					lng: locale,
				}),
			);
		}

		if (args.pattern) {
			parameterStrings.push(
				i18next.t('command.mod.anti_raid_nuke.errors.parameters.pattern', {
					lng: locale,
				}),
				Formatters.codeBlock(`^${args.pattern}$`),
			);
		}

		const deletionDays = args.days === undefined ? 1 : Math.min(Math.max(Number(args.days), 0), 7);
		if (deletionDays) {
			parameterStrings.push(
				i18next.t('command.mod.anti_raid_nuke.errors.parameters.days', {
					lng: locale,
					count: deletionDays,
				}),
			);
		} else {
			parameterStrings.push(
				i18next.t('command.mod.anti_raid_nuke.errors.parameters.days_none', {
					lng: locale,
				}),
			);
		}

		if (!members.size) {
			await interaction.editReply({
				content: `${i18next.t('command.mod.anti_raid_nuke.errors.no_hits', {
					lng: locale,
				})}\n\n${parameterStrings.join('\n')}`,
			});
			return;
		}

		const banKey = nanoid();
		const cancelKey = nanoid();

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

		await interaction.editReply({
			content: `${i18next.t('command.mod.anti_raid_nuke.pending', {
				members: members.size,
				creationrange,
				joinrange,
				lng: locale,
			})}\n\n${parameterStrings.join('\n')}`,
			files: [{ name: `${potentialHitsDate}-anti-raid-nuke-list.txt`, attachment: potentialHits }],
			components: [createMessageActionRow([cancelButton, banButton])],
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
		} else if (collectedInteraction?.customId === banKey) {
			await collectedInteraction.update({
				components: [
					createMessageActionRow([
						{ ...cancelButton, disabled: true },
						{ ...banButton, disabled: true },
					]),
				],
			});

			await this.redis.setex(`guild:${collectedInteraction.guildId}:anti_raid_nuke`, 15, 'true');
			let idx = 0;
			const promises = [];
			const fatalities: GuildMember[] = [];
			const survivors: GuildMember[] = [];
			for (const member of members.values()) {
				promises.push(
					createCase(
						collectedInteraction.guild,
						generateCasePayload({
							guildId: collectedInteraction.guildId,
							user: collectedInteraction.user,
							args: {
								reason: i18next.t('command.mod.anti_raid_nuke.reason', {
									current: ++idx,
									members: members.size,
									lng: locale,
								}),
								user: {
									member: member,
									user: member.user,
								},
								days: args.days ? Math.min(Math.max(Number(args.days), 0), 7) : 1,
								joinCutoff: dayjs(joinCutoff).toDate(),
								accountCutoff: dayjs(accountCutoff).toDate(),
							},
							action: CaseAction.Ban,
							multi: true,
						}),
					)
						.then((case_) => {
							fatalities.push(member);
							return case_;
						})
						.catch(() => {
							survivors.push(member);
						})
						.finally(() => void this.redis.expire(`guild:${collectedInteraction.guildId}:anti_raid_nuke`, 15)),
				);
			}

			const resolvedCases = await Promise.all(promises);
			const cases = resolvedCases.filter((resolvedCase) => resolvedCase) as Case[];
			await this.redis.expire(`guild:${collectedInteraction.guildId}:anti_raid_nuke`, 5);

			await insertAntiRaidNukeCaseLog(
				collectedInteraction.guild,
				collectedInteraction.user,
				logChannel,
				cases,
				args.reason ?? i18next.t('command.mod.anti_raid_nuke.success', { lng: locale, members: fatalities.length }),
			);

			const membersHit = Buffer.from(fatalities.map((member) => member.id).join('\r\n'));
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
	}
}

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
import { inject, injectable } from 'tsyringe';
import type { Redis } from 'ioredis';

import type { ArgumentsOf } from '../../interactions/ArgumentsOf';
import type { Command } from '../../Command';
import type { AntiRaidNukeCommand } from '../../interactions';
import { Case, CaseAction, createCase } from '../../functions/cases/createCase';
import { generateCasePayload } from '../../functions/logs/generateCasePayload';
import { checkModRole } from '../../functions/permissions/checkModRole';
import { DATE_FORMAT_LOGFILE } from '../../Constants';
import { checkLogChannel } from '../../functions/settings/checkLogChannel';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting';
import { kRedis } from '../../tokens';
import { insertAntiRaidNukeCaseLog } from '../../functions/logs/insertAntiRaidNukeCaseLog';

@injectable()
export default class implements Command {
	public constructor(@inject(kRedis) public readonly redis: Redis) {}

	public async execute(
		interaction: CommandInteraction,
		args: ArgumentsOf<typeof AntiRaidNukeCommand>,
		locale: string,
	): Promise<void> {
		await interaction.defer();
		await checkModRole(interaction, locale);

		const logChannel = await checkLogChannel(
			interaction.guild!,
			await getGuildSetting(interaction.guildId!, SettingsKeys.ModLogChannelId),
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

		const fetchedMembers = await interaction.guild?.members.fetch({ force: true });
		const members = fetchedMembers?.filter(
			(member) => member.joinedTimestamp! > joinCutoff && member.user.createdTimestamp > accountCutoff,
		);

		if (!members?.size) {
			await interaction.editReply({
				content: `${i18next.t('command.mod.anti_raid_nuke.errors.no_hits', {
					lng: locale,
				})}\n\n${i18next.t('command.mod.anti_raid_nuke.errors.parameters', {
					now: Formatters.time(dayjs().unix(), Formatters.TimestampStyles.ShortDateTime),
					join: Formatters.time(dayjs(joinCutoff).unix(), Formatters.TimestampStyles.ShortDateTime),
					age: Formatters.time(dayjs(accountCutoff).unix(), Formatters.TimestampStyles.ShortDateTime),
					lng: locale,
				})}`,
			});
			return;
		}

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
				age: Formatters.time(dayjs(accountCutoff).unix(), Formatters.TimestampStyles.ShortDateTime),
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
						content: i18next.t('common.errors.timed_out', { lng: locale }),
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
				attachments: [],
			});
		} else if (collectedInteraction?.customId === banKey) {
			await collectedInteraction.deferUpdate();

			await this.redis.setex(`guild:${collectedInteraction.guildId!}:anti_raid_nuke`, 15, 'true');
			let idx = 0;
			const promises = [];
			const fatalities: GuildMember[] = [];
			const survivors: GuildMember[] = [];
			for (const member of members.values()) {
				promises.push(
					createCase(
						collectedInteraction.guild!,
						generateCasePayload({
							guildId: collectedInteraction.guildId!,
							user: collectedInteraction.user,
							args: {
								reason: i18next.t('command.mod.anti_raid_nuke.reason', {
									current: ++idx,
									size: members.size,
									lng: locale,
								}),
								user: {
									member: member,
									user: member.user,
								},
								// @ts-expect-error
								days: args.days ? Math.min(Math.max(Number(args.days), 0), 7) : 0,
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
						.finally(() => void this.redis.expire(`guild:${collectedInteraction.guildId!}:anti_raid_nuke`, 15)),
				);
			}

			const resolvedCases = await Promise.all(promises);
			const cases = resolvedCases.filter((resolvedCase) => resolvedCase) as Case[];
			await this.redis.expire(`guild:${collectedInteraction.guildId!}:anti_raid_nuke`, 5);

			await insertAntiRaidNukeCaseLog(
				collectedInteraction.guild!,
				collectedInteraction.user,
				logChannel,
				cases,
				args.reason ?? i18next.t('command.mod.anti_raid_nuke.success', { lng: locale }),
			);

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
	}
}

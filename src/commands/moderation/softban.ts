import { type BaseCommandInteraction, type ButtonInteraction, MessageActionRow, MessageButton } from 'discord.js';
import i18next from 'i18next';
import type { Redis } from 'ioredis';
import { nanoid } from 'nanoid';
import { inject, injectable } from 'tsyringe';
import type { Command } from '../../Command';
import { CaseAction, createCase } from '../../functions/cases/createCase';
import { generateCasePayload } from '../../functions/logs/generateCasePayload';
import { upsertCaseLog } from '../../functions/logs/upsertCaseLog';
import { checkModRole } from '../../functions/permissions/checkModRole';
import { checkLogChannel } from '../../functions/settings/checkLogChannel';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting';
import type { SoftbanCommand } from '../../interactions';
import type { ArgumentsOf } from '../../interactions/ArgumentsOf';
import { logger } from '../../logger';
import { kRedis } from '../../tokens';
import { awaitComponent } from '../../util/awaitComponent';
import { generateHistory } from '../../util/generateHistory';

@injectable()
export default class implements Command {
	public constructor(@inject(kRedis) public readonly redis: Redis) {}

	public async execute(
		interaction: BaseCommandInteraction<'cached'>,
		args: ArgumentsOf<typeof SoftbanCommand>,
		locale: string,
	): Promise<void> {
		const reply = await interaction.deferReply({ ephemeral: true, fetchReply: true });
		await checkModRole(interaction, locale);

		const logChannel = await checkLogChannel(
			interaction.guild,
			(await getGuildSetting(interaction.guildId, SettingsKeys.ModLogChannelId)) as string,
		);
		if (!logChannel) {
			throw new Error(i18next.t('common.errors.no_mod_log_channel', { lng: locale }));
		}

		if (args.user.member && !args.user.member.bannable) {
			throw new Error(
				i18next.t('command.mod.softban.errors.missing_permissions', {
					user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
					lng: locale,
				}),
			);
		}

		const isStillMember = interaction.guild.members.resolve(args.user.user.id);

		if (args.reason && args.reason.length >= 500) {
			throw new Error(i18next.t('command.mod.common.errors.max_length_reason', { lng: locale }));
		}

		const softbanKey = nanoid();
		const cancelKey = nanoid();

		const embed = await generateHistory(interaction, args.user, locale);

		const softbanButton = new MessageButton()
			.setCustomId(softbanKey)
			.setLabel(i18next.t('command.mod.softban.buttons.execute', { lng: locale }))
			.setStyle('DANGER');
		const cancelButton = new MessageButton()
			.setCustomId(cancelKey)
			.setLabel(i18next.t('command.mod.softban.buttons.cancel', { lng: locale }))
			.setStyle('SECONDARY');

		await interaction.editReply({
			content: i18next.t(isStillMember ? 'command.mod.softban.pending' : 'command.mod.softban.not_member', {
				user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
				lng: locale,
			}),
			embeds: isStillMember ? [embed] : [],
			components: [new MessageActionRow().addComponents([cancelButton, softbanButton])],
		});

		const collectedInteraction = (await awaitComponent(interaction.client, reply, {
			filter: (collected) => collected.user.id === interaction.user.id,
			componentType: 'BUTTON',
			time: 15000,
		}).catch(async () => {
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
		})) as ButtonInteraction<'cached'> | undefined;

		if (collectedInteraction?.customId === cancelKey) {
			await collectedInteraction.update({
				content: i18next.t('command.mod.softban.cancel', {
					user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
					lng: locale,
				}),
				components: [],
			});
		} else if (collectedInteraction?.customId === softbanKey) {
			await collectedInteraction.deferUpdate();

			// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
			await this.redis.setex(`guild:${collectedInteraction.guildId}:user:${args.user.user.id}:ban`, 15, '');
			// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
			await this.redis.setex(`guild:${collectedInteraction.guildId}:user:${args.user.user.id}:unban`, 15, '');

			if (isStillMember) {
				const case_ = await createCase(
					collectedInteraction.guild,
					generateCasePayload({
						guildId: collectedInteraction.guildId,
						user: collectedInteraction.user,
						args: {
							...args,
							days: args.days ? Math.min(Math.max(Number(args.days), 0), 7) : 1,
						},
						action: CaseAction.Softban,
					}),
				);
				await upsertCaseLog(collectedInteraction.guildId, collectedInteraction.user, case_);
			} else {
				const reason = i18next.t('command.mod.softban.reasons.clear_messages', {
					user: collectedInteraction.user.tag,
					lng: locale,
				});

				await interaction.guild.bans.create(args.user.user, {
					reason,
					days: args.days ? Math.min(Math.max(Number(args.days), 0), 7) : 1,
				});
				await interaction.guild.bans.remove(args.user.user, reason);
			}

			await collectedInteraction.editReply({
				content: i18next.t(
					isStillMember ? 'command.mod.softban.success.regular' : 'command.mod.softban.success.clear_messages',
					{
						user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
						lng: locale,
					},
				),
				components: [],
			});
		}
	}
}

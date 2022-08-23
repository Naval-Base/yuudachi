import { TextInputStyle, ComponentType } from 'discord.js';
import i18next from 'i18next';
import type { Redis } from 'ioredis';
import { nanoid } from 'nanoid';
import { inject, injectable } from 'tsyringe';
import { message } from './sub/report/message.js';
import { user } from './sub/report/user.js';
import { type ArgsParam, Command, type InteractionParam, type LocaleParam, type CommandMethod } from '../../Command.js';
import { checkLogChannel } from '../../functions/settings/checkLogChannel.js';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting.js';
import type { ReportCommand, ReportMessageContextCommand, ReportUserContextCommand } from '../../interactions/index.js';
import { logger } from '../../logger.js';
import { kRedis } from '../../tokens.js';
import { createModal } from '../../util/modal.js';
import { createModalActionRow } from '../../util/modalActionRow.js';
import { parseMessageLink, resolveMessage } from '../../util/resolveMessage.js';
import { createTextComponent } from '../../util/textComponent.js';

@injectable()
export default class extends Command<
	typeof ReportCommand | typeof ReportMessageContextCommand | typeof ReportUserContextCommand
> {
	public constructor(@inject(kRedis) public readonly redis: Redis) {
		super(['report', 'Report message', 'Report user']);
	}

	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<typeof ReportCommand>,
		locale: LocaleParam,
	): Promise<void> {
		await interaction.deferReply({ ephemeral: true });

		const reportChannelId = await getGuildSetting(interaction.guildId, SettingsKeys.ReportChannelId);
		const reportChannel = checkLogChannel(interaction.guild, reportChannelId);
		if (!reportChannel) {
			throw new Error(i18next.t('common.errors.no_report_channel', { lng: locale }));
		}

		if (Object.keys(args)[0] === 'message') {
			const parsedLink = parseMessageLink(args.message.message_link);

			if (!parsedLink) {
				throw new Error(
					i18next.t('command.common.errors.not_message_link', {
						val: args.message.message_link,
						arg: 'message_link',
						lng: locale,
					}),
				);
			}

			const { guildId, channelId, messageId } = parsedLink;
			const messageArg = await resolveMessage(interaction.channelId, guildId!, channelId!, messageId!, locale);

			if (messageArg.author.id === interaction.user.id) {
				throw new Error(i18next.t('command.utility.report.commons.errors.no_self', { lng: locale }));
			}

			const key = `guild:${interaction.guildId}:report:channel:${interaction.channelId}:message:${messageArg.id}`;

			if (await this.redis.exists(key)) {
				throw new Error(i18next.t('command.utility.report.commons.errors.recently_reported.message', { lng: locale }));
			}

			await message(
				interaction,
				{
					reason: args.message.reason,
					message: messageArg,
				},
				locale,
			);
		} else {
			if (args.user.user.user.id === interaction.user.id) {
				throw new Error(i18next.t('command.utility.report.commons.errors.no_self', { lng: locale }));
			}

			const key = `guild:${interaction.guildId}:report:user:${args.user.user.user.id}`;

			if (await this.redis.exists(key)) {
				throw new Error(i18next.t('command.utility.report.commons.errors.recently_reported.message', { lng: locale }));
			}

			if (!args.user.user.member) {
				throw new Error(i18next.t('command.common.errors.target_not_found', { lng: locale }));
			}

			await user(interaction, args.user, locale);
		}
	}

	public override async userContext(
		interaction: InteractionParam<CommandMethod.UserContext>,
		args: ArgsParam<typeof ReportUserContextCommand>,
		locale: LocaleParam,
	): Promise<void> {
		const modalKey = nanoid();

		if (args.user.user.id === interaction.user.id) {
			throw new Error(i18next.t('command.utility.report.commons.errors.no_self', { lng: locale }));
		}

		const key = `guild:${interaction.guildId}:report:user:${args.user.user.id}`;

		if (await this.redis.exists(key)) {
			throw new Error(i18next.t('command.utility.report.commons.errors.recently_reported.user', { lng: locale }));
		}

		if (!args.user.member) {
			throw new Error(i18next.t('command.common.errors.target_not_found', { lng: locale }));
		}

		const reportChannelId = await getGuildSetting(interaction.guildId, SettingsKeys.ReportChannelId);
		const reportChannel = checkLogChannel(interaction.guild, reportChannelId);
		if (!reportChannel) {
			throw new Error(i18next.t('common.errors.no_report_channel', { lng: locale }));
		}

		const modal = createModal({
			customId: modalKey,
			title: i18next.t('command.utility.report.user.modal.title', { lng: locale }),
			components: [
				createModalActionRow([
					createTextComponent({
						customId: 'reason',
						label: i18next.t('command.utility.report.commons.modal.label', { lng: locale }),
						minLength: 10,
						maxLength: 1900,
						placeholder: i18next.t('command.utility.report.commons.modal.placeholder', { lng: locale }),
						required: true,
						style: TextInputStyle.Paragraph,
					}),
				]),
			],
		});

		await interaction.showModal(modal);

		const modalInteraction = await interaction
			.awaitModalSubmit({
				time: 120000,
				filter: (component) => component.customId === modalKey,
			})
			.catch(async () => {
				try {
					await interaction.followUp({
						content: i18next.t('command.utility.report.commons.errors.timed_out', { lng: locale }),
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

		await modalInteraction.deferReply({ ephemeral: true });

		const reason = modalInteraction.components
			.map((row) => row.components)
			.flat()
			.map((component) => (component.type === ComponentType.TextInput ? component.value || '' : ''));

		await user(
			modalInteraction,
			{
				user: args.user,
				reason: reason.join(' '),
			},
			locale,
		);
	}

	public override async messageContext(
		interaction: InteractionParam<CommandMethod.MessageContext>,
		args: ArgsParam<typeof ReportMessageContextCommand>,
		locale: LocaleParam,
	): Promise<void> {
		const modalKey = nanoid();

		if (args.message.author.id === interaction.user.id) {
			throw new Error(i18next.t('command.utility.report.commons.errors.no_self', { lng: locale }));
		}

		const key = `guild:${interaction.guildId}:report:channel:${interaction.channelId}:message:${args.message.id}`;

		if (await this.redis.exists(key)) {
			throw new Error(i18next.t('command.utility.report.commons.errors.recently_reported.message', { lng: locale }));
		}

		const reportChannelId = await getGuildSetting(interaction.guildId, SettingsKeys.ReportChannelId);
		const reportChannel = checkLogChannel(interaction.guild, reportChannelId);
		if (!reportChannel) {
			throw new Error(i18next.t('common.errors.no_report_channel', { lng: locale }));
		}

		const modal = createModal({
			customId: modalKey,
			title: i18next.t('command.utility.report.message.modal.title', { lng: locale }),
			components: [
				createModalActionRow([
					createTextComponent({
						customId: 'reason',
						label: i18next.t('command.utility.report.commons.modal.label', { lng: locale }),
						minLength: 10,
						maxLength: 1900,
						placeholder: i18next.t('command.utility.report.commons.modal.placeholder', { lng: locale }),
						required: true,
						style: TextInputStyle.Paragraph,
					}),
				]),
			],
		});

		await interaction.showModal(modal);

		const modalInteraction = await interaction
			.awaitModalSubmit({
				time: 120000,
				filter: (component) => component.customId === modalKey,
			})
			.catch(async () => {
				try {
					await interaction.followUp({
						content: i18next.t('command.utility.report.commons.errors.timed_out', { lng: locale }),
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

		await modalInteraction.deferReply({ ephemeral: true });

		const reason = modalInteraction.components
			.map((row) => row.components)
			.flat()
			.map((component) => (component.type === ComponentType.TextInput ? component.value || '' : ''));

		await message(
			modalInteraction,
			{
				message: args.message,
				reason: reason.join(' '),
			},
			locale,
		);
	}
}

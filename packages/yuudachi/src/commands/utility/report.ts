import { TextInputStyle, ComponentType } from 'discord.js';
import i18next from 'i18next';
import { nanoid } from 'nanoid';
import { message } from './sub/report/message.js';
import { user } from './sub/report/user.js';
import { type ArgsParam, Command, type InteractionParam, type LocaleParam, type CommandMethod } from '../../Command.js';
import { checkLogChannel } from '../../functions/settings/checkLogChannel.js';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting.js';
import type { ReportCommand, ReportMessageContextCommand } from '../../interactions/index.js';
import { logger } from '../../logger.js';
import { createModal } from '../../util/modal.js';
import { createModalActionRow } from '../../util/modalActionRow.js';
import { parseMessageLink, resolveMessage } from '../../util/resolveMessage.js';
import { createTextComponent } from '../../util/textComponent.js';

export default class extends Command<typeof ReportCommand | typeof ReportMessageContextCommand> {
	public constructor() {
		super(['report', 'Report message']);
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

			await message(
				interaction,
				{
					reason: args.message.reason,
					message: messageArg,
				},
				locale,
			);
		} else if (Object.keys(args)[0] === 'user') {
			await user(interaction, args.user, locale);
		}
	}

	public override async messageContext(
		interaction: InteractionParam<CommandMethod.MessageContext>,
		args: ArgsParam<typeof ReportMessageContextCommand>,
		locale: LocaleParam,
	): Promise<void> {
		const user = interaction.targetMessage.author;

		const modalKey = nanoid();

		const modal = createModal({
			customId: modalKey,
			title: i18next.t('command.utility.report.message.modal.title', { lng: locale, user: user.tag }),
			components: [
				createModalActionRow([
					createTextComponent({
						customId: 'reason',
						label: i18next.t('command.utility.report.message.modal.label', { lng: locale }),
						minLength: 10,
						maxLength: 1900,
						placeholder: i18next.t('command.utility.report.message.modal.placeholder', { lng: locale }),
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

		await modalInteraction.deferReply({ ephemeral: true });

		const reportChannelId = await getGuildSetting(interaction.guildId, SettingsKeys.ReportChannelId);
		const reportChannel = checkLogChannel(interaction.guild, reportChannelId);
		if (!reportChannel) {
			throw new Error(i18next.t('common.errors.no_report_channel', { lng: locale }));
		}

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

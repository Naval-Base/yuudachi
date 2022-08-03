import i18next from 'i18next';
import { type ArgsParam, Command, type InteractionParam, type LocaleParam, type CommandMethod } from '../../Command.js';
import type { RepostCommand, RepostMessageContextCommand } from '../../interactions/index.js';
import { addFields, truncateEmbed } from '../../util/embed.js';

export default class extends Command<typeof RepostCommand | typeof RepostMessageContextCommand> {
	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<typeof RepostCommand>,
		locale: LocaleParam,
	): Promise<void> {
		await interaction.deferReply();

		const linkRegex =
			/(?:https?:\/\/(?:ptb\.|canary\.)?discord\.com\/channels\/(?<guildId>\d{17,20})\/(?<channelId>\d{17,20})\/(?<messageId>\d{17,20}))/gi;
		const groups = args.message_link.match(linkRegex)?.groups;

		if (!groups) {
			throw new Error(
				i18next.t('command.utility.repost.errors.not_message_link', {
					val: args.message_link,
					arg: 'message_link',
					lng: locale,
				}),
			);
		}

		const { guildId, channelId, messageId } = groups;
		const guild = interaction.client.guilds.cache.get(guildId!);

		if (!guild) {
			throw new Error(
				i18next.t('command.utility.repost.errors.no_guild', {
					guild_id: guildId,
					lng: locale,
				}),
			);
		}

		const channel = guild.channels.cache.get(channelId!);

		if (!channel?.isTextBased()) {
			throw new Error(
				i18next.t('command.utility.repost.errors.no_channel', {
					channel_id: channelId,
					guild: guild.name,
					lng: locale,
				}),
			);
		}

		const message = await channel.messages.fetch(messageId!).catch(() => {
			throw new Error(
				i18next.t('command.common.errors.no_message', {
					message_id: messageId!,
					// eslint-disable-next-line @typescript-eslint/no-base-to-string
					channel: channel.toString(),
					lng: locale,
				}),
			);
		});

		const author = message.author;
		const embed = addFields({
			author: { name: `${author.tag} (${author.id})`, icon_url: author.displayAvatarURL() },
			description: message.content,
			footer: {
				// eslint-disable-next-line @typescript-eslint/no-base-to-string
				text: message.channel.toString(),
			},
			timestamp: message.createdAt.toISOString(),
		});

		await interaction.editReply({ embeds: [truncateEmbed(embed)] });
	}

	public override async messageContext(
		interaction: InteractionParam<CommandMethod.MessageContext>,
		args: ArgsParam<typeof RepostMessageContextCommand>,
		_: LocaleParam,
	): Promise<void> {
		const author = args.message.author;
		const embed = addFields({
			author: { name: `${author.tag} (${author.id})`, icon_url: author.displayAvatarURL() },
			description: args.message.content,
			footer: {
				// eslint-disable-next-line @typescript-eslint/no-base-to-string
				text: args.message.channel.toString(),
			},
			timestamp: args.message.createdAt.toISOString(),
		});

		await interaction.reply({ embeds: [truncateEmbed(embed)] });
	}
}

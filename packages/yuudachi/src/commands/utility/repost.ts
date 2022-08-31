import type { Message } from "discord.js";
import i18next from "i18next";
import { type ArgsParam, Command, type InteractionParam, type LocaleParam, type CommandMethod } from "../../Command.js";
import { formatMessageToEmbed } from "../../functions/logging/formatMessageToEmbed.js";
import type { RepostCommand, RepostMessageContextCommand } from "../../interactions/index.js";
import { parseMessageLink, resolveMessage } from "../../util/resolveMessage.js";

export default class extends Command<typeof RepostCommand | typeof RepostMessageContextCommand> {
	private async handle(
		interaction: InteractionParam | InteractionParam<CommandMethod.MessageContext>,
		message: Message<true>,
		locale: string,
	) {
		await interaction.editReply({ embeds: [formatMessageToEmbed(message, locale)] });
	}

	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<typeof RepostCommand>,
		locale: LocaleParam,
	): Promise<void> {
		await interaction.deferReply();
		const parsedLink = parseMessageLink(args.message_link);

		if (!parsedLink) {
			throw new Error(
				i18next.t("command.common.errors.not_message_link", {
					val: args.message_link,
					arg: "message_link",
					lng: locale,
				}),
			);
		}

		const { guildId, channelId, messageId } = parsedLink;
		const message = await resolveMessage(interaction.channelId, guildId!, channelId!, messageId!, locale);

		await this.handle(interaction, message, locale);
	}

	public override async messageContext(
		interaction: InteractionParam<CommandMethod.MessageContext>,
		args: ArgsParam<typeof RepostMessageContextCommand>,
		locale: LocaleParam,
	): Promise<void> {
		await interaction.deferReply();
		await this.handle(interaction, args.message, locale);
	}
}

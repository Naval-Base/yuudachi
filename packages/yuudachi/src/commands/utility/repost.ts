import { type ArgsParam, Command, type InteractionParam, type LocaleParam, type CommandMethod } from '../../Command.js';
import type { RepostMessageContextCommand } from '../../interactions/index.js';
import { addFields, truncateEmbed } from '../../util/embed.js';

export default class extends Command<typeof RepostMessageContextCommand> {
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

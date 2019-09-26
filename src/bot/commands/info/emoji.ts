import { stripIndents } from 'common-tags';
import { Command } from 'discord-akairo';
import { GuildEmoji, Message, MessageEmbed } from 'discord.js';
import * as moment from 'moment';
import * as emojis from 'node-emoji';
import * as punycode from 'punycode';
import { MESSAGES } from '../../util/constants';

const EMOJI_REGEX = /<(?:a)?:(?:\w{2,32}):(\d{17,19})>?/;

export default class EmojiInfoCommand extends Command {
	public constructor() {
		super('emoji', {
			aliases: ['emoji', 'emoji-info'],
			description: {
				content: MESSAGES.COMMANDS.INFO.EMOJI.DESCRIPTION,
				usage: '<emoji>',
				examples: ['🤔', 'thinking_face', '264701195573133315', '<:Thonk:264701195573133315>'],
			},
			category: 'info',
			channel: 'guild',
			clientPermissions: ['EMBED_LINKS'],
			ratelimit: 2,
			args: [
				{
					id: 'emoji',
					match: 'content',
					type: async (message, content) => {
						// eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
						if (EMOJI_REGEX.test(content)) [, content] = content.match(EMOJI_REGEX)!;
						if (!isNaN((content as unknown) as number)) return message.guild!.emojis.get(content);
						return message.guild!.emojis.find(e => e.name === content) || emojis.find(content);
					},
					prompt: {
						start: (message: Message) => MESSAGES.COMMANDS.INFO.EMOJI.PROMPT.START(message.author),
						retry: (message: Message) => MESSAGES.COMMANDS.INFO.EMOJI.PROMPT.RETRY(message.author),
					},
				},
			],
		});
	}

	public async exec(message: Message, { emoji }: { emoji: GuildEmoji | emojis.Emoji }) {
		const embed = new MessageEmbed().setColor(3447003);

		if (emoji instanceof GuildEmoji) {
			embed.setDescription(`Info about ${emoji.name} (ID: ${emoji.id})`);
			embed.setThumbnail(emoji.url);
			embed.addField(
				'❯ Info',
				stripIndents`
				• Identifier: \`<${emoji.identifier}>\`
				• Creation Date: ${moment.utc(emoji.createdAt).format('YYYY/MM/DD hh:mm:ss')}
				• URL: ${emoji.url}
				`,
			);
		} else {
			embed.setDescription(`Info about ${emoji.emoji}`);
			embed.addField(
				'❯ Info',
				stripIndents`
				• Name: \`${emoji.key}\`
				• Raw: \`${emoji.emoji}\`
				• Unicode: \`${punycode.ucs2
					.decode(emoji.emoji)
					.map(
						(e: any) =>
							`\\u${e
								.toString(16)
								.toUpperCase()
								.padStart(4, '0')}`,
					)
					.join('')}\`
				`,
			);
		}

		return message.util!.send(embed);
	}
}

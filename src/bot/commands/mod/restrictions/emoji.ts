import { Command } from 'discord-akairo';
import { GuildMember, Message, Permissions } from 'discord.js';
import EmojiAction from '../../../structures/case/actions/Emoji';
import { MESSAGES } from '../../../util/constants';

export default class RestrictEmojiCommand extends Command {
	public constructor() {
		super('restrict-emoji', {
			category: 'mod',
			description: {
				content: MESSAGES.COMMANDS.MOD.RESTRICTIONS.EMOJI.DESCRIPTION,
				usage: '<member> [--ref=number] [--nsfw] [...reason]',
			},
			channel: 'guild',
			clientPermissions: [Permissions.FLAGS.MANAGE_ROLES],
			ratelimit: 2,
			args: [
				{
					id: 'member',
					type: 'member',
					prompt: {
						start: (message: Message) => MESSAGES.COMMANDS.MOD.RESTRICTIONS.EMOJI.PROMPT.START(message.author),
						retry: (message: Message) => MESSAGES.COMMANDS.MOD.RESTRICTIONS.EMOJI.PROMPT.RETRY(message.author),
					},
				},
				{
					id: 'ref',
					type: 'integer',
					match: 'option',
					flag: ['--ref=', '-r='],
				},
				{
					id: 'nsfw',
					match: 'flag',
					flag: ['--nsfw'],
				},
				{
					id: 'reason',
					match: 'rest',
					type: 'string',
					default: '',
				},
			],
		});
	}

	public async exec(
		message: Message,
		{ member, ref, nsfw, reason }: { member: GuildMember; ref: number; nsfw: boolean; reason: string },
	) {
		if (member.id === message.author.id) return;
		const guild = message.guild!;
		const key = `${guild.id}:${member.id}:EMOJI`;
		guild.caseQueue.add(async () =>
			new EmojiAction({
				message,
				member,
				keys: key,
				reason,
				ref,
				nsfw,
			}).commit(),
		);
	}
}

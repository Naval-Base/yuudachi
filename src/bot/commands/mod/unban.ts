import { Command, PrefixSupplier } from 'discord-akairo';
import { Message, User, TextChannel } from 'discord.js';
import { ACTIONS, COLORS } from '../../util';

export default class UnbanCommand extends Command {
	public constructor() {
		super('unban', {
			aliases: ['unban'],
			category: 'mod',
			description: {
				content: 'Unbans a user, duh.',
				usage: '<member> [--ref=number] [...reason]',
				examples: ['@Crawl', '@Crawl appealed', '@Souji --ref=1234 appealed', '@Souji --ref=1234']
			},
			channel: 'guild',
			clientPermissions: ['MANAGE_ROLES'],
			ratelimit: 2,
			args: [
				{
					id: 'user',
					type: async (_, id) => {
						const user = await this.client.users.fetch(id);
						return user;
					},
					prompt: {
						start: (message: Message) => `${message.author}, what member do you want to unban?`,
						retry: (message: Message) => `${message.author}, please mention a member.`
					}
				},
				{
					id: 'ref',
					type: 'integer',
					match: 'option',
					flag: ['--ref=', '-r=']
				},
				{
					'id': 'reason',
					'match': 'rest',
					'type': 'string',
					'default': ''
				}
			]
		});
	}

	// @ts-ignore
	public userPermissions(message: Message) {
		const staffRole = this.client.settings.get<string>(message.guild!, 'modRole', undefined);
		const hasStaffRole = message.member!.roles.has(staffRole);
		if (!hasStaffRole) return 'Moderator';
		return null;
	}

	public async exec(message: Message, { user, ref, reason }: { user: User; ref: number; reason: string }) {
		if (user.id === message.author!.id) return;

		const key = `${message.guild!.id}:${user.id}:UNBAN`;
		if (this.client.cachedCases.has(key)) {
			return message.reply('that user is currently being moderated by someone else.');
		}
		this.client.cachedCases.add(key);

		const totalCases = this.client.settings.get<number>(message.guild!, 'caseTotal', 0) + 1;

		try {
			await message.guild!.members.unban(user, `Unbanned by ${message.author!.tag} | Case #${totalCases}`);
		} catch (error) {
			this.client.cachedCases.delete(key);
			return message.reply(`there was an error unbanning this user: \`${error}\``);
		}

		this.client.settings.set(message.guild!, 'caseTotal', totalCases);

		if (!reason) {
			const prefix = (this.handler.prefix as PrefixSupplier)(message);
			reason = `Use \`${prefix}reason ${totalCases} <...reason>\` to set a reason for this case`;
		}

		const modLogChannel = this.client.settings.get<string>(message.guild!, 'modLogChannel', undefined);
		let modMessage;
		if (modLogChannel) {
			const embed = (await this.client.caseHandler.log(user, 'Unban', totalCases, reason, message, undefined, ref)).setColor(COLORS.UNBAN);
			modMessage = await (this.client.channels.get(modLogChannel) as TextChannel).send(embed);
		}

		await this.client.caseHandler.create({
			guild: message.guild!.id,
			message: modMessage ? modMessage.id : undefined,
			case_id: totalCases,
			target_id: user.id,
			target_tag: user.tag,
			mod_id: message.author!.id,
			mod_tag: message.author!.tag,
			action: ACTIONS.UNBAN,
			reason
		});

		return message.util!.send(`Successfully unbanned **${user.tag}**`);
	}
}

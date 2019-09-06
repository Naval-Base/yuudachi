import { Command, PrefixSupplier } from 'discord-akairo';
import { Message, GuildMember, TextChannel } from 'discord.js';
import Util from '../../util';
import { Case } from '../../models/Cases';

export default class RestrictEmojiCommand extends Command {
	public constructor() {
		super('restrict-emoji', {
			category: 'mod',
			description: {
				content: 'Restrict a members ability to use custom emoji.',
				usage: '<member> [--ref=number] [...reason]'
			},
			channel: 'guild',
			clientPermissions: ['MANAGE_ROLES'],
			ratelimit: 2,
			args: [
				{
					id: 'member',
					type: 'member',
					prompt: {
						start: (message: Message) => `${message.author}, what member do you want to restrict?`,
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

	public async exec(message: Message, { member, ref, reason }: { member: GuildMember; ref: number; reason: string }) {
		const staffRole = this.client.settings.get<string>(message.guild!, 'modRole', undefined);
		if (member.id === message.author!.id) return;
		if (member.roles.has(staffRole)) {
			return message.reply('nuh-uh! You know you can\'t do this.');
		}

		const restrictRoles = this.client.settings.get<{ emoji: string }>(message.guild!, 'restrictRoles', undefined);
		if (!restrictRoles) return message.reply('there are no restricted roles configured on this server.');

		const key = `${message.guild!.id}:${member.id}:EMOJI`;
		if (this.client.cachedCases.has(key)) {
			return message.reply('that user is currently being moderated by someone else.');
		}
		this.client.cachedCases.add(key);

		const totalCases = this.client.settings.get<number>(message.guild!, 'caseTotal', 0) + 1;

		try {
			await member.roles.add(restrictRoles.emoji, `Embed restricted by ${message.author!.tag} | Case #${totalCases}`);
		} catch (error) {
			this.client.cachedCases.delete(key);
			return message.reply(`there was an error emoji restricting this member: \`${error}\``);
		}

		this.client.settings.set(message.guild!, 'caseTotal', totalCases);

		if (!reason) {
			const prefix = (this.handler.prefix as PrefixSupplier)(message);
			reason = `Use \`${prefix}reason ${totalCases} <...reason>\` to set a reason for this case`;
		}

		const casesRepo = this.client.db.getRepository(Case);

		const modLogChannel = this.client.settings.get<string>(message.guild!, 'modLogChannel', undefined);
		let modMessage;
		if (modLogChannel) {
			const embed = (await Util.logEmbed({ message, db: casesRepo, channel: modLogChannel, member, action: 'Emoji restriction', caseNum: totalCases, reason, ref })).setColor(Util.CONSTANTS.COLORS.EMOJI);
			modMessage = await (this.client.channels.get(modLogChannel) as TextChannel).send(embed);
		}

		const dbCase = new Case();
		dbCase.guild = message.guild!.id;
		if (modMessage) dbCase.message = modMessage.id;
		dbCase.case_id = totalCases;
		dbCase.target_id = member.id;
		dbCase.target_tag = member.user.tag;
		dbCase.mod_id = message.author!.id;
		dbCase.mod_tag = message.author!.tag;
		dbCase.action = Util.CONSTANTS.ACTIONS.EMOJI;
		dbCase.reason = reason;
		await casesRepo.save(dbCase);

		return message.util!.send(`Successfully emoji restricted **${member.user.tag}**`);
	}
}

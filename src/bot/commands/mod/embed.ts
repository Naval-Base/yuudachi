import { Command } from 'discord-akairo';
import { Message, GuildMember, TextChannel } from 'discord.js';
import Util from '../../util';
import { Case } from '../../models/Cases';

export default class RestrictEmbedCommand extends Command {
	public constructor() {
		super('restrict-embed', {
			category: 'mod',
			description: {
				content: 'Restrict a members ability to post embeds/upload files.',
				usage: '<member> <...reason>',
				examples: []
			},
			channel: 'guild',
			clientPermissions: ['MANAGE_ROLES'],
			ratelimit: 2,
			args: [
				{
					id: 'member',
					type: 'member',
					prompt: {
						start: (message: Message): string => `${message.author}, what member do you want to restrict?`,
						retry: (message: Message): string => `${message.author}, please mention a member.`
					}
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
	public userPermissions(message: Message): string | null {
		const staffRole = this.client.settings.get(message.guild!, 'modRole', undefined);
		const hasStaffRole = message.member!.roles.has(staffRole);
		if (!hasStaffRole) return 'Moderator';
		return null;
	}

	public async exec(message: Message, { member, reason }: { member: GuildMember; reason: string }): Promise<Message | Message[] | void> {
		const staffRole = this.client.settings.get(message.guild!, 'modRole', undefined);
		if (member.id === message.author!.id) return;
		if (member.roles.has(staffRole)) {
			return message.reply('nuh-uh! You know you can\'t do this.');
		}

		const restrictRoles = this.client.settings.get(message.guild!, 'restrictRoles', undefined);
		if (!restrictRoles) return message.reply('there are no restricted roles configured on this server.');

		const key = `${message.guild!.id}:${member.id}:EMBED`;
		if (this.client.cachedCases.has(key)) {
			return message.reply('that user is currently being moderated by someone else.');
		}
		this.client.cachedCases.add(key);

		const totalCases = this.client.settings.get(message.guild!, 'caseTotal', 0) as number + 1;

		try {
			await member.roles.add(restrictRoles.embed, `Embed restricted by ${message.author!.tag} | Case #${totalCases}`);
		} catch (error) {
			this.client.cachedCases.delete(key);
			return message.reply(`there was an error embed retricting this member: \`${error}\``);
		}

		this.client.settings.set(message.guild!, 'caseTotal', totalCases);

		if (!reason) {
			// @ts-ignore
			const prefix = this.handler.prefix(message);
			reason = `Use \`${prefix}reason ${totalCases} <...reason>\` to set a reason for this case`;
		}

		const modLogChannel = this.client.settings.get(message.guild!, 'modLogChannel', undefined);
		let modMessage;
		if (modLogChannel) {
			const embed = Util.logEmbed({ message, member, action: 'Embed restriction', caseNum: totalCases, reason }).setColor(Util.CONSTANTS.COLORS.EMBED);
			modMessage = await (this.client.channels.get(modLogChannel) as TextChannel).send(embed) as Message;
		}

		const casesRepo = this.client.db.getRepository(Case);
		const dbCase = new Case();
		dbCase.guild = message.guild!.id;
		if (modMessage) dbCase.message = modMessage.id;
		dbCase.case_id = totalCases;
		dbCase.target_id = member.id;
		dbCase.target_tag = member.user.tag;
		dbCase.mod_id = message.author!.id;
		dbCase.mod_tag = message.author!.tag;
		dbCase.action = Util.CONSTANTS.ACTIONS.EMBED;
		dbCase.reason = reason;
		await casesRepo.save(dbCase);

		return message.util!.send(`Successfully embed restricted **${member.user.tag}**`);
	}
}

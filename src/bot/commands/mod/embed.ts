import { Command, PrefixSupplier } from 'discord-akairo';
import { Message, GuildMember, TextChannel } from 'discord.js';
import { ACTIONS, COLORS } from '../../util';

export default class RestrictEmbedCommand extends Command {
	public constructor() {
		super('restrict-embed', {
			category: 'mod',
			description: {
				content: 'Restrict a members ability to post embeds/upload files.',
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

		const restrictRoles = this.client.settings.get<{ embed: string }>(message.guild!, 'restrictRoles', undefined);
		if (!restrictRoles) return message.reply('there are no restricted roles configured on this server.');

		const key = `${message.guild!.id}:${member.id}:EMBED`;
		if (this.client.cachedCases.has(key)) {
			return message.reply('that user is currently being moderated by someone else.');
		}
		this.client.cachedCases.add(key);

		const totalCases = this.client.settings.get<number>(message.guild!, 'caseTotal', 0) + 1;

		try {
			await member.roles.add(restrictRoles.embed, `Embed restricted by ${message.author!.tag} | Case #${totalCases}`);
		} catch (error) {
			this.client.cachedCases.delete(key);
			return message.reply(`there was an error embed retricting this member: \`${error}\``);
		}

		this.client.settings.set(message.guild!, 'caseTotal', totalCases);

		if (!reason) {
			const prefix = (this.handler.prefix as PrefixSupplier)(message);
			reason = `Use \`${prefix}reason ${totalCases} <...reason>\` to set a reason for this case`;
		}

		const modLogChannel = this.client.settings.get<string>(message.guild!, 'modLogChannel', undefined);
		let modMessage;
		if (modLogChannel) {
			const embed = (await this.client.caseHandler.log(member, 'Embed restriction', totalCases, reason, message, undefined, ref)).setColor(COLORS.EMBED);
			modMessage = await (this.client.channels.get(modLogChannel) as TextChannel).send(embed);
		}

		await this.client.caseHandler.create({
			guild: message.guild!.id,
			message: modMessage ? modMessage.id : undefined,
			case_id: totalCases,
			target_id: member.id,
			target_tag: member.user.tag,
			mod_id: message.author!.id,
			mod_tag: message.author!.tag,
			action: ACTIONS.EMBED,
			reason
		});

		return message.util!.send(`Successfully embed restricted **${member.user.tag}**`);
	}
}

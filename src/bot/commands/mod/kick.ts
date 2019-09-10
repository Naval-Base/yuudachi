import { Command, PrefixSupplier } from 'discord-akairo';
import { Message, GuildMember, TextChannel } from 'discord.js';
import { stripIndents } from 'common-tags';
import { ACTIONS, COLORS } from '../../util';

export default class KickCommand extends Command {
	public constructor() {
		super('kick', {
			aliases: ['kick'],
			category: 'mod',
			description: {
				content: 'Kicks a member, duh.',
				usage: '<member> [--ref=number] [...reason]',
				examples: ['@Crawl', '@Crawl dumb', '@Souji --ref=1234 no u']
			},
			channel: 'guild',
			clientPermissions: ['MANAGE_ROLES'],
			ratelimit: 2,
			args: [
				{
					id: 'member',
					type: 'member',
					prompt: {
						start: (message: Message) => `${message.author}, what member do you want to kick?`,
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

		const totalCases = this.client.settings.get<number>(message.guild!, 'caseTotal', 0) + 1;

		let sentMessage;
		try {
			sentMessage = await message.channel.send(`Kicking **${member.user.tag}**...`);
			try {
				await member.send(stripIndents`
					**You have been kicked from ${message.guild!.name}**
					${reason ? `\n**Reason:** ${reason}\n` : ''}
					You may rejoin whenever.
				`);
			} catch {}
			await member.kick(`Kicked by ${message.author!.tag} | Case #${totalCases}`);
		} catch (error) {
			return message.reply('there is no mute role configured on this server.');
		}

		this.client.settings.set(message.guild!, 'caseTotal', totalCases);

		if (!reason) {
			const prefix = (this.handler.prefix as PrefixSupplier)(message);
			reason = `Use \`${prefix}reason ${totalCases} <...reason>\` to set a reason for this case`;
		}

		const modLogChannel = this.client.settings.get<string>(message.guild!, 'modLogChannel', undefined);
		let modMessage;
		if (modLogChannel) {
			const embed = (
				await this.client.caseHandler.log({
					member,
					action: 'Kick',
					caseNum: totalCases,
					reason,
					message,
					ref
				})
			).setColor(COLORS.KICK);
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
			action: ACTIONS.KICK,
			reason
		});

		return sentMessage.edit(`Successfully kicked **${member.user.tag}**`);
	}
}

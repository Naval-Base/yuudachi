import { Command, PrefixSupplier } from 'discord-akairo';
import { Message, GuildMember, TextChannel } from 'discord.js';
import { stripIndents } from 'common-tags';
import { ACTIONS, COLORS } from '../../util';

export default class SoftbanCommand extends Command {
	public constructor() {
		super('softban', {
			aliases: ['softban'],
			category: 'mod',
			description: {
				content: 'Softbans a member, duh.',
				usage: '<member> [--ref=number] [...reason]',
				examples: ['@Crawl', '@Crawl dumb', '@Souji --days=1 no u', '@Souji --ref=1234 just no']
			},
			channel: 'guild',
			clientPermissions: ['MANAGE_ROLES'],
			ratelimit: 2,
			args: [
				{
					id: 'member',
					type: 'member',
					prompt: {
						start: (message: Message) => `${message.author}, what member do you want to softban?`,
						retry: (message: Message) => `${message.author}, please mention a member.`
					}
				},
				{
					'id': 'days',
					'type': 'integer',
					'match': 'option',
					'flag': ['--days', '-d'],
					'default': 1
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

	public async exec(message: Message, { member, days, ref, reason }: { member: GuildMember; days: number; ref: number; reason: string }) {
		const staffRole = this.client.settings.get<string>(message.guild!, 'modRole', undefined);
		if (member.id === message.author!.id) return;
		if (member.roles.has(staffRole)) {
			return message.reply('nuh-uh! You know you can\'t do this.');
		}

		const keys = [`${message.guild!.id}:${member.id}:BAN`, `${message.guild!.id}:${member.id}:UNBAN`];
		if (this.client.caseHandler.cachedCases.has(keys[0]) && this.client.caseHandler.cachedCases.has(keys[1])) {
			return message.reply('that user is currently being moderated by someone else.');
		}
		this.client.caseHandler.cachedCases.add(keys[0]);
		this.client.caseHandler.cachedCases.add(keys[1]);

		const totalCases = this.client.settings.get<number>(message.guild!, 'caseTotal', 0) + 1;

		let sentMessage;
		try {
			sentMessage = await message.channel.send(`Softbanning **${member.user.tag}**...`);
			try {
				await member.send(stripIndents`
					**You have been softbanned from ${message.guild!.name}**
					${reason ? `\n**Reason:** ${reason}\n` : ''}
					A softban is a kick that uses ban + unban to remove your messages from the server.
					You may rejoin whenever.
				`);
			} catch {}
			await member.ban({ days, reason: `Softbanned by ${message.author!.tag} | Case #${totalCases}` });
			await message.guild!.members.unban(member, `Softbanned by ${message.author!.tag} | Case #${totalCases}`);
		} catch (error) {
			this.client.caseHandler.cachedCases.delete(keys[0]);
			this.client.caseHandler.cachedCases.delete(keys[1]);
			return message.reply(`there was an error softbanning this member: \`${error}\``);
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
					action: 'Softban',
					caseNum: totalCases,
					reason,
					message,
					ref
				})
			).setColor(COLORS.SOFTBAN);
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
			action: ACTIONS.SOFTBAN,
			reason
		});

		return sentMessage.edit(`Successfully softbanned **${member.user.tag}**`);
	}
}

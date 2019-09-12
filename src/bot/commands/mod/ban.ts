import { Argument, Command, PrefixSupplier } from 'discord-akairo';
import { Message, GuildMember, TextChannel } from 'discord.js';
import { stripIndents } from 'common-tags';
import { ACTIONS, COLORS } from '../../util';

export default class BanCommand extends Command {
	public constructor() {
		super('ban', {
			aliases: ['ban'],
			category: 'mod',
			description: {
				content: 'Bans a member, duh.',
				usage: '<member> [--days=number] [--ref=number] [...reason]',
				examples: ['@Crawl', '@Crawl dumb', '@Souji --days=1 no u', '@Souji --ref=1234 just no']
			},
			channel: 'guild',
			clientPermissions: ['MANAGE_ROLES', 'EMBED_LINKS'],
			ratelimit: 2,
			args: [
				{
					id: 'member',
					type: Argument.union('member', async (_, phrase) => {
						const m = await this.client.users.fetch(phrase);
						if (m) return { id: m.id, user: m };
						return null;
					}),
					prompt: {
						start: (message: Message) => `${message.author}, what member do you want to ban?`,
						retry: (message: Message) => `${message.author}, please mention a member.`
					}
				},
				{
					'id': 'days',
					'type': 'integer',
					'match': 'option',
					'flag': ['--days=', '-d='],
					'default': 7
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
		if (member.id === message.author!.id) {
			await message.reply('you asked for it, ok?');
			try {
				await member.kick(`${message.author!.tag} used a mod command on themselves.`);
			} catch {}
			return;
		}
		if (member.roles && member.roles.has(staffRole)) {
			return message.reply('nuh-uh! You know you can\'t do this.');
		}
		const key = `${message.guild!.id}:${member.id}:BAN`;
		if (this.client.caseHandler.cachedCases.has(key)) {
			return message.reply('that user is currently being moderated by someone else.');
		}
		this.client.caseHandler.cachedCases.add(key);

		const embed = await this.client.caseHandler.history(member);
		await message.channel.send('You sure you want me to ban this [no gender specified]?', { embed });
		const responses = await message.channel.awaitMessages(msg => msg.author.id === message.author!.id, {
			max: 1,
			time: 10000
		});

		if (!responses || responses.size !== 1) {
			this.client.caseHandler.cachedCases.delete(key);
			return message.reply('timed out. Cancelled ban.');
		}
		const response = responses.first();

		let sentMessage;
		if (/^y(?:e(?:a|s)?)?$/i.test(response!.content)) {
			sentMessage = await message.channel.send(`Banning **${member.user.tag}**...`);
		} else {
			this.client.caseHandler.cachedCases.delete(key);
			return message.reply('cancelled ban.');
		}

		const totalCases = this.client.settings.get<number>(message.guild!, 'caseTotal', 0) + 1;

		try {
			try {
				await member.send(stripIndents`
					**You have been banned from ${message.guild!.name}**
					${reason ? `\n**Reason:** ${reason}\n` : ''}
					You can appeal your ban by DMing \`Crawl#0002\` with a message why you think you deserve to have your ban lifted.
				`);
			} catch {}
			await member.ban({ days, reason: `Banned by ${message.author!.tag} | Case #${totalCases}` });
		} catch {
			try {
				await message.guild!.members.ban(member.id, { days, reason: `Banned by ${message.author!.tag} | Case #${totalCases}` });
			} catch (error) {
				this.client.caseHandler.cachedCases.delete(key);
				return message.reply(`there was an error banning this member: \`${error}\``);
			}
		}

		this.client.settings.set(message.guild!, 'caseTotal', totalCases);

		if (!reason) {
			const prefix = (this.handler.prefix as PrefixSupplier)(message);
			reason = `Use \`${prefix}reason ${totalCases} <...reason>\` to set a reason for this case`;
		}

		const modLogChannel = this.client.settings.get<string>(message.guild!, 'modLogChannel', undefined);
		let modMessage;
		if (modLogChannel) {
			const e = (
				await this.client.caseHandler.log({
					member,
					action: 'Ban',
					caseNum: totalCases,
					reason,
					message,
					ref
				})
			).setColor(COLORS.BAN);
			modMessage = await (this.client.channels.get(modLogChannel) as TextChannel).send(e);
		}

		await this.client.caseHandler.create({
			guild: message.guild!.id,
			message: modMessage ? modMessage.id : undefined,
			case_id: totalCases,
			target_id: member.id,
			target_tag: member.user.tag,
			mod_id: message.author!.id,
			mod_tag: message.author!.tag,
			action: ACTIONS.BAN,
			reason
		});

		return sentMessage.edit(`Successfully banned **${member.user.tag}**`);
	}
}

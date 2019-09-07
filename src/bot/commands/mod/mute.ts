import { Command, PrefixSupplier } from 'discord-akairo';
import { Message, GuildMember, TextChannel } from 'discord.js';
import { ACTIONS, COLORS } from '../../util';
const ms = require('@naval-base/ms'); // eslint-disable-line

export default class MuteCommand extends Command {
	public constructor() {
		super('mute', {
			aliases: ['mute'],
			category: 'mod',
			description: {
				content: 'Mutes a member, duh.',
				usage: '<member> <duration> [--ref=number] [...reason]',
				examples: ['@Crawl 20m', '@Crawl 20m no u', '@Souji 14d --ref=1234 just stop']
			},
			channel: 'guild',
			clientPermissions: ['MANAGE_ROLES'],
			ratelimit: 2,
			args: [
				{
					id: 'member',
					type: 'member',
					prompt: {
						start: (message: Message) => `${message.author}, what member do you want to mute?`,
						retry: (message: Message) => `${message.author}, please mention a member.`
					}
				},
				{
					id: 'duration',
					type: (_, str): number | null => {
						if (!str) return null;
						const duration = ms(str);
						if (duration && duration >= 300000 && !isNaN(duration)) return duration;
						return null;
					},
					prompt: {
						start: (message: Message) => `${message.author}, for how long do you want the mute to last?`,
						retry: (message: Message) => `${message.author}, please use a proper time format.`
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

	public async exec(message: Message, { member, duration, ref, reason }: { member: GuildMember; duration: number; ref: number; reason: string }) {
		const staffRole = this.client.settings.get<string>(message.guild!, 'modRole', undefined);
		if (member.id === message.author!.id) return;
		if (member.roles.has(staffRole)) {
			return message.reply('nuh-uh! You know you can\'t do this.');
		}

		const muteRole = this.client.settings.get<string>(message.guild!, 'muteRole', undefined);
		if (!muteRole) return message.reply('there is no mute role configured on this server.');

		const key = `${message.guild!.id}:${member.id}:MUTE`;
		if (this.client.caseHandler.cachedCases.has(key)) {
			return message.reply('that user is currently being moderated by someone else.');
		}
		this.client.caseHandler.cachedCases.add(key);

		const totalCases = this.client.settings.get<number>(message.guild!, 'caseTotal', 0) + 1;

		try {
			await member.roles.add(muteRole, `Muted by ${message.author!.tag} | Case #${totalCases}`);
		} catch (error) {
			this.client.caseHandler.cachedCases.delete(key);
			return message.reply(`there was an error muting this member: \`${error}\``);
		}

		this.client.settings.set(message.guild!, 'caseTotal', totalCases);

		if (!reason) {
			const prefix = (this.handler.prefix as PrefixSupplier)(message);
			reason = `Use \`${prefix}reason ${totalCases} <...reason>\` to set a reason for this case`;
		}

		const modLogChannel = this.client.settings.get<string>(message.guild!, 'modLogChannel', undefined);
		let modMessage;
		if (modLogChannel) {
			const embed = (await this.client.caseHandler.log(member, 'Mute', totalCases, reason, message, duration, ref)).setColor(COLORS.MUTE);
			modMessage = await (this.client.channels.get(modLogChannel) as TextChannel).send(embed);
		}

		await this.client.muteScheduler.add({
			guild: message.guild!.id,
			message: modMessage ? modMessage.id : undefined,
			case_id: totalCases,
			target_id: member.id,
			target_tag: member.user.tag,
			mod_id: message.author!.id,
			mod_tag: message.author!.tag,
			action: ACTIONS.MUTE,
			action_duration: new Date(Date.now() + duration),
			action_processed: false,
			reason
		});

		return message.util!.send(`Successfully muted **${member.user.tag}**`);
	}
}

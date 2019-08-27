import { Command, PrefixSupplier } from 'discord-akairo';
import { Message, GuildMember, TextChannel } from 'discord.js';
import Util from '../../util';
import { Case } from '../../models/Cases';

export default class WarnCommand extends Command {
	public constructor() {
		super('warn', {
			aliases: ['warn'],
			category: 'mod',
			description: {
				content: 'Warns a user, duh.',
				usage: '<member> [--ref=number] [...reason]',
				examples: ['@Crawl', '@Crawl dumb', '@Souji --ref=1234 no u', '@Souji --ref=1234']
			},
			channel: 'guild',
			clientPermissions: ['MANAGE_ROLES'],
			ratelimit: 2,
			args: [
				{
					id: 'member',
					type: 'member',
					prompt: {
						start: (message: Message): string => `${message.author}, what member do you want to warn?`,
						retry: (message: Message): string => `${message.author}, please mention a member.`
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
	public userPermissions(message: Message): string | null {
		const staffRole = this.client.settings.get(message.guild!, 'modRole', undefined);
		const hasStaffRole = message.member!.roles.has(staffRole);
		if (!hasStaffRole) return 'Moderator';
		return null;
	}

	public async exec(message: Message, { member, ref, reason }: { member: GuildMember; ref: number; reason: string }): Promise<Message | Message[] | void> {
		const staffRole = this.client.settings.get(message.guild!, 'modRole', undefined);
		if (member.id === message.author!.id) return;
		if (member.roles.has(staffRole)) {
			return message.reply('nuh-uh! You know you can\'t do this.');
		}

		const totalCases = this.client.settings.get(message.guild!, 'caseTotal', 0) as number + 1;
		this.client.settings.set(message.guild!, 'caseTotal', totalCases);

		if (!reason) {
			const prefix = (this.handler.prefix as PrefixSupplier)(message);
			reason = `Use \`${prefix}reason ${totalCases} <...reason>\` to set a reason for this case`;
		}

		const casesRepo = this.client.db.getRepository(Case);

		const modLogChannel = this.client.settings.get(message.guild!, 'modLogChannel', undefined);
		let modMessage;
		if (modLogChannel) {
			const embed = (await Util.logEmbed({ message, db: casesRepo, channel: modLogChannel, member, action: 'Warn', caseNum: totalCases, reason, ref })).setColor(Util.CONSTANTS.COLORS.WARN);
			modMessage = await (this.client.channels.get(modLogChannel) as TextChannel).send(embed) as Message;
		}

		const dbCase = new Case();
		dbCase.guild = message.guild!.id;
		if (modMessage) dbCase.message = modMessage.id;
		dbCase.case_id = totalCases;
		dbCase.target_id = member.id;
		dbCase.target_tag = member.user.tag;
		dbCase.mod_id = message.author!.id;
		dbCase.mod_tag = message.author!.tag;
		dbCase.action = Util.CONSTANTS.ACTIONS.WARN;
		dbCase.reason = reason;
		await casesRepo.save(dbCase);

		return message.util!.send(`Successfully warned **${member.user.tag}**`);
	}
}

import { Argument, Command } from 'discord-akairo';
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { MESSAGES, SETTINGS } from '../../util/constants';

export default class ReasonCommand extends Command {
	public constructor() {
		super('reason', {
			aliases: ['reason'],
			category: 'mod',
			description: {
				content: MESSAGES.COMMANDS.MOD.REASON.DESCRIPTION,
				usage: '<case> [--ref=number] <...reason>',
				examples: ['1234 dumb', 'latest dumb', 'latest --ref=1234 cool'],
			},
			channel: 'guild',
			clientPermissions: ['MANAGE_ROLES'],
			ratelimit: 2,
			args: [
				{
					id: 'caseNum',
					type: Argument.union('number', 'string'),
					prompt: {
						start: (message: Message) => MESSAGES.COMMANDS.MOD.REASON.PROMPT.START(message.author),
						retry: (message: Message) => MESSAGES.COMMANDS.MOD.REASON.PROMPT.RETRY(message.author),
					},
				},
				{
					id: 'ref',
					type: 'integer',
					match: 'option',
					flag: ['--ref=', '-r='],
				},
				{
					id: 'reason',
					match: 'rest',
					type: 'string',
				},
			],
		});
	}

	// @ts-ignore
	public userPermissions(message: Message) {
		const staffRole = this.client.settings.get<string>(message.guild!, SETTINGS.MOD_ROLE, undefined);
		const hasStaffRole = message.member!.roles.has(staffRole);
		if (!hasStaffRole) return 'Moderator';
		return null;
	}

	public async exec(
		message: Message,
		{ caseNum, ref, reason }: { caseNum: number | string; ref: number; reason: string },
	) {
		const totalCases = this.client.settings.get<number>(message.guild!, SETTINGS.CASES, 0);
		const caseToFind = caseNum === 'latest' || caseNum === 'l' ? totalCases : (caseNum as number);
		if (isNaN(caseToFind)) return message.reply(MESSAGES.COMMANDS.MOD.REASON.NO_CASE_NUMBER);
		const dbCase = await this.client.caseHandler.repo.findOne({ case_id: caseToFind });
		if (!dbCase) {
			return message.reply(MESSAGES.COMMANDS.MOD.REASON.NO_CASE);
		}
		if (dbCase.mod_id && (dbCase.mod_id !== message.author!.id && !message.member!.permissions.has('MANAGE_GUILD'))) {
			return message.reply(MESSAGES.COMMANDS.MOD.REASON.WRONG_MOD);
		}

		const modLogChannel = this.client.settings.get<string>(message.guild!, SETTINGS.MOD_LOG, undefined);
		if (modLogChannel) {
			const caseEmbed = await (this.client.channels.get(modLogChannel) as TextChannel).messages.fetch(dbCase.message!);
			if (!caseEmbed) return message.reply(MESSAGES.COMMANDS.MOD.REASON.NO_MESSAGE);
			const embed = new MessageEmbed(caseEmbed.embeds[0]);
			embed.setAuthor(`${message.author!.tag} (${message.author!.id})`, message.author!.displayAvatarURL());
			embed.setDescription(caseEmbed.embeds[0].description.replace(/\*\*Reason:\*\* [\s\S]+/, `**Reason:** ${reason}`));
			if (ref) {
				let reference;
				try {
					reference = await this.client.caseHandler.repo.findOne({ guild: message.guild!.id, case_id: ref });
				} catch (error) {
					reference = null;
				}
				if (reference) {
					if (/\*\*Ref case:\*\* [\s\S]+/.test(embed.description)) {
						embed.setDescription(embed.description.replace(/\*\*Ref case:\*\* [\s\S]+/, `**Ref case:** ${reason}`));
					} else {
						embed.setDescription(
							`${embed.description}\n**Ref case:** [${reference.case_id}](https://discordapp.com/channels/${reference.guild}/${modLogChannel}/${reference.message})`,
						);
					}
				}
			}
			await caseEmbed.edit(embed);
		}

		dbCase.mod_id = message.author!.id;
		dbCase.mod_tag = message.author!.tag;
		dbCase.reason = reason;
		await this.client.caseHandler.repo.save(dbCase);

		return message.util!.send(MESSAGES.COMMANDS.MOD.REASON.REPLY(caseToFind));
	}
}

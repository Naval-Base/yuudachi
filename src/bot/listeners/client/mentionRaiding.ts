import { Listener } from 'discord-akairo';
import { Message, Snowflake, TextChannel, GuildMember } from 'discord.js';
import { Case } from '../../models/Cases';
import Util from '../../util';
import { stripIndents } from 'common-tags';

interface MentionData {
	count: number;
	timestamp: Date;
}

export default class MentionRaidingListener extends Listener {
	private recentMentions = new Map<Snowflake, MentionData[]>();

	public constructor() {
		super('mentionRaid', {
			emitter: 'client',
			event: 'message',
			category: 'client'
		});
	}

	public exec(message: Message): void {
		const mentionCount = message.mentions.users.size;
		if (mentionCount === 0 || message.member === null) return;

		const mentionRaiding = this.client.settings.get(message.member.guild, 'mentionRaiding', undefined);
		if (!mentionRaiding) return;

		const id = message.member.id;
		if (!this.recentMentions.has(id)) {
			this.recentMentions.set(id, []);
		}

		let memberMentionData = this.recentMentions.get(id) || [];

		memberMentionData = memberMentionData.filter(mentionData => Date.now() - mentionData.timestamp.getTime() < 6000);

		memberMentionData.push({
			count: mentionCount,
			timestamp: message.createdAt
		});

		this.recentMentions.set(id, memberMentionData);

		const totalMentions = memberMentionData.map(mentionData => mentionData.count).reduce((a, b) => a + b);
		if (totalMentions >= 50) {
			this.banRaider(message, message.member);
		}
	}

	private async banRaider(message: Message, member: GuildMember) {
		const reason = 'Raiding';
		const days = 1;

		const key = `${message.guild!.id}:${member.id}:BAN`;
		if (this.client.cachedCases.has(key)) {
			return;
		}
		this.client.cachedCases.add(key);

		const casesRepo = this.client.db.getRepository(Case);

		const totalCases = this.client.settings.get(message.guild!, 'caseTotal', 0) as number + 1;

		try {
			try {
				await member.send(stripIndents`
					**You have been banned from ${message.guild!.name}**
					\n**Reason:** ${reason}\n
					You can appeal your ban by DMing \`Crawl#0002\` with a message why you think you deserve to have your ban lifted.
				`);
			} catch {}
			await member.ban({ days, reason: `Banned automatically | Case #${totalCases}` });
		} catch {
			try {
				await message.guild!.members.ban(member.id, { days, reason: `Banned automatically | Case #${totalCases}` });
			} catch (error) {
				this.client.cachedCases.delete(key);
				return message.reply(`there was an error banning this member: \`${error}\``);
			}
		}

		this.client.settings.set(message.guild!, 'caseTotal', totalCases);

		const modLogChannel = this.client.settings.get(message.guild!, 'modLogChannel', undefined);
		let modMessage;
		if (modLogChannel) {
			const e = (await Util.logEmbed({ message, db: casesRepo, channel: modLogChannel, member, action: 'Ban', caseNum: totalCases, reason })).setColor(Util.CONSTANTS.COLORS.BAN);
			modMessage = await (this.client.channels.get(modLogChannel) as TextChannel).send(e) as Message;
		}

		const dbCase = new Case();
		dbCase.guild = message.guild!.id;
		if (modMessage) dbCase.message = modMessage.id;
		dbCase.case_id = totalCases;
		dbCase.target_id = member.id;
		dbCase.target_tag = member.user.tag;
		dbCase.mod_id = message.author!.id;
		dbCase.mod_tag = message.author!.tag;
		dbCase.action = Util.CONSTANTS.ACTIONS.BAN;
		dbCase.reason = reason;
		await casesRepo.save(dbCase);
	}
}

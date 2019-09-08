import { Listener } from 'discord-akairo';
import { Message, Snowflake } from 'discord.js';
import BanAction from '../../structures/case/actions/Ban';
import { SETTINGS } from '../../util/constants';

interface MentionData {
	count: number;
	timestamp: Date;
}

export default class MentionRaidingListener extends Listener {
	private readonly recentMentions = new Map<Snowflake, MentionData[]>();

	public constructor() {
		super('mentionRaid', {
			emitter: 'client',
			event: 'message',
			category: 'client',
		});
	}

	public exec(message: Message): void {
		const mentionCount = message.mentions.users.size;
		if (mentionCount === 0 || message.member === null) return;

		const member = message.member;
		const mentionRaiding = this.client.settings.get(member.guild, SETTINGS.MENTION_RAIDING);
		if (!mentionRaiding) return;

		const id = member.id;
		if (!this.recentMentions.has(id)) {
			this.recentMentions.set(id, []);
		}

		let memberMentionData = this.recentMentions.get(id) || [];

		memberMentionData = memberMentionData.filter(mentionData => Date.now() - mentionData.timestamp.getTime() < 6000);

		memberMentionData.push({
			count: mentionCount,
			timestamp: message.createdAt,
		});

		this.recentMentions.set(id, memberMentionData);

		const totalMentions = memberMentionData.map(mentionData => mentionData.count).reduce((a, b) => a + b);
		if (totalMentions >= 50) {
			const key = `${message.guild!.id}:${member.id}:BAN`;
			message.guild!.caseQueue.add(async () =>
				new BanAction({
					message,
					member,
					keys: key,
					reason: 'Raiding',
					days: 1,
				}).commit(),
			);
		}
	}
}

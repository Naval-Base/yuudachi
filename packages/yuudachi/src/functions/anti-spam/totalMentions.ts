import { FormattingPatterns } from 'discord-api-types/v10';
import type { GuildMember, User } from 'discord.js';
import type { Redis } from 'ioredis';
import { container } from 'tsyringe';
import { MENTION_EXPIRE_SECONDS } from '../../Constants.js';
import { kRedis } from '../../tokens.js';

const gUserPattern = /<@\d{17,20}>/g;

export async function totalMentions(member: GuildMember, content: string) {
	const redis = container.resolve<Redis>(kRedis);

	const parsed = new Map<string, User>();

	for (const mention of content.matchAll(gUserPattern)) {
		const id = mention[0]?.match(FormattingPatterns.User)?.[1];
		try {
			const user = await member.client.users.fetch(id!);
			parsed.set(id!, user);
		} catch {}
	}

	console.log(parsed);

	const attemptAtEveryoneOrHere = ['@everyone', '@here'].some((pattern) => content.includes(pattern));
	const mentionCountKey = `guild:${member.guild.id}:user:${member.id}:mentions`;
	const increment = parsed.size + (attemptAtEveryoneOrHere ? 1 : 0);

	const total = await redis.incrby(mentionCountKey, increment);

	if (total === increment) {
		await redis.expire(mentionCountKey, MENTION_EXPIRE_SECONDS);
	}

	return total;
}

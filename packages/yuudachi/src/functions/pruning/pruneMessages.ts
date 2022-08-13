import { Collection, type GuildTextBasedChannel, type Message, type Snowflake, SnowflakeUtil } from 'discord.js';

interface MessageOrder {
	newest?: Message | undefined | null;
	oldest: Message;
}

export function orderMessages(first: Message, second?: Message | undefined | null): MessageOrder {
	if (first.id === second?.id || !second) {
		return {
			newest: undefined,
			oldest: first,
		};
	}

	const firstTimestamp = SnowflakeUtil.timestampFrom(first.id);
	const secondTimestamp = SnowflakeUtil.timestampFrom(second.id);

	return {
		newest: firstTimestamp > secondTimestamp ? first : second,
		oldest: firstTimestamp < secondTimestamp ? first : second,
	};
}

export async function fetchMessages(from: Message, to?: Message | undefined | null) {
	const { newest, oldest } = orderMessages(from, to);
	const res = new Collection<Snowflake, Message>();

	if (newest) {
		res.set(newest.id, newest);
	}

	let pivot = newest;

	const earliestPossiblePrune = Date.now() - 12 * 60 * 60 * 1000;
	while (
		pivot ? oldest.createdTimestamp < pivot.createdTimestamp && pivot.createdTimestamp > earliestPossiblePrune : true
	) {
		const messages = await oldest.channel.messages.fetch({
			limit: 100,
			before: pivot?.id,
			cache: false,
		});
		for (const message of messages.values()) {
			if (message.createdTimestamp >= oldest.createdTimestamp && message.createdTimestamp >= earliestPossiblePrune) {
				res.set(message.id, message);
			} else {
				break;
			}
		}
		pivot = messages.last();
	}

	return res;
}

export function chunkMessages(messages: Collection<Snowflake, Message>) {
	const res = [];
	const chunk = [];

	for (const message of messages.values()) {
		if (chunk.length === 100) {
			res.push([...chunk]);
			chunk.length = 0;
		}
		chunk.push(message);
	}

	if (chunk.length) {
		res.push([...chunk]);
	}

	return res;
}

export async function pruneMessages(messages: Collection<Snowflake, Message>) {
	const deletedMessages = new Set<Snowflake>();
	const channel = messages.first()!.channel as GuildTextBasedChannel;

	for (const chunk of chunkMessages(messages)) {
		const deleted = await channel.bulkDelete(chunk, true);
		deleted.forEach((_, id) => deletedMessages.add(id));
	}

	return messages.filter((message) => deletedMessages.has(message.id));
}

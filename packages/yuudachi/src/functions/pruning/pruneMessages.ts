import { Collection, type GuildTextBasedChannel, type Message, type Snowflake, SnowflakeUtil } from "discord.js";

type MessageOrder = {
	newest?: Message | null | undefined;
	oldest: Message;
};

export function orderMessages(first: Message, second?: Message | null | undefined): MessageOrder {
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

export async function fetchMessages(from: Message, to?: Message | null | undefined) {
	const { newest, oldest } = orderMessages(from, to);
	const res = new Collection<Snowflake, Message>();

	if (newest) {
		res.set(newest.id, newest);
	}

	let pivot = newest;

	const earliestPossiblePrune = Date.now() - 12 * 60 * 60 * 1_000;
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
	const result = [];
	const chunk = [];

	for (const message of messages.values()) {
		if (chunk.length === 100) {
			result.push([...chunk]);
			chunk.length = 0;
		}

		chunk.push(message);
	}

	if (chunk.length) {
		result.push([...chunk]);
	}

	return result;
}

export async function pruneMessages(messages: Collection<Snowflake, Message>) {
	const deletedMessages = new Set<Snowflake>();
	const channel = messages.first()!.channel as GuildTextBasedChannel;

	for (const chunk of chunkMessages(messages)) {
		const deleted = await channel.bulkDelete(chunk, true);
		for (const [id] of deleted.entries()) {
			deletedMessages.add(id);
		}
	}

	return messages.filter((message) => deletedMessages.has(message.id));
}

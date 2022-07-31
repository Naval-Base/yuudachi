import { Collection, GuildTextBasedChannel, Message, Snowflake, SnowflakeUtil, TextBasedChannel } from 'discord.js';

interface MessageOrder {
	newest?: Message;
	oldest: Message;
}

function orderMessages(first: Message, second?: Message): MessageOrder {
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

export async function fetchMessages(channel: TextBasedChannel, from: Message, to?: Message) {
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
		console.log('fetching more', {
			pivot: pivot?.createdTimestamp,
			oldest: oldest.createdTimestamp,
			res_size: res.size,
		});

		const messages = await channel.messages.fetch({
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

	console.log('res size: ', res.size);
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

export async function pruneMessages(channel: GuildTextBasedChannel, messages: Collection<Snowflake, Message>) {
	console.log(messages.map((m) => `${m.author.tag}: ${m.content}`).join('\n'));

	const res = new Collection<Snowflake, Message>();
	for (const chunk of chunkMessages(messages)) {
		const deleted = await channel.bulkDelete(chunk, true);
		res.concat(deleted);
	}

	return res;
}

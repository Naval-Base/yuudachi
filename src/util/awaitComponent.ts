import type { APIMessage } from 'discord-api-types/v9';
import {
	type Client,
	type CollectorFilter,
	type Interaction,
	InteractionCollector,
	type Message,
	Constants,
	type AwaitMessageCollectorOptionsParams,
	type MessageComponentTypeResolvable,
	type MappedInteractionTypes,
} from 'discord.js';

export function awaitComponent<T extends MessageComponentTypeResolvable = 'ACTION_ROW'>(
	client: Client,
	message: Message | APIMessage,
	options: AwaitMessageCollectorOptionsParams<T> = {},
): Promise<MappedInteractionTypes[T]> {
	const _options = { ...options, max: 1 };
	return new Promise((resolve, reject) => {
		const collector = new InteractionCollector(client, {
			...(_options as unknown as CollectorFilter<[Interaction]>),
			interactionType: Constants.InteractionTypes.MESSAGE_COMPONENT,
			message,
		});

		collector.once('end', (interactions, reason) => {
			const interaction = interactions.first();
			if (interaction) resolve(interaction as MappedInteractionTypes[T]);
			else reject(new Error(reason));
		});
	});
}

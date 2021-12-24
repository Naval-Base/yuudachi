import {
	Client,
	CollectorFilter,
	Interaction,
	InteractionCollector,
	Message,
	Constants,
	AwaitMessageCollectorOptionsParams,
	MessageComponentTypeResolvable,
	MappedInteractionTypes,
} from 'discord.js';
import type { APIMessage } from 'discord-api-types/v9';

export function awaitComponent<T extends MessageComponentTypeResolvable = 'ACTION_ROW'>(
	client: Client,
	message: Message | APIMessage,
	options: AwaitMessageCollectorOptionsParams<T> = {},
): Promise<MappedInteractionTypes<true>[T]> {
	const _options = { ...options, max: 1 };
	return new Promise((resolve, reject) => {
		const collector = new InteractionCollector(client, {
			...(_options as unknown as CollectorFilter<[Interaction]>),
			interactionType: Constants.InteractionTypes.MESSAGE_COMPONENT,
			// @ts-ignore
			message,
		});

		collector.once('end', (interactions, reason) => {
			const interaction = interactions.first();
			if (interaction) resolve(interaction as unknown as MappedInteractionTypes<true>[T]);
			else reject(new Error(reason));
		});
	});
}

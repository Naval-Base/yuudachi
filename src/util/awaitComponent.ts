import {
	Client,
	CollectorFilter,
	Interaction,
	InteractionCollector,
	Message,
	MessageComponentType,
	Constants,
	AwaitMessageCollectorOptionsParams,
	MappedInteractionTypes,
} from 'discord.js';
import type { APIMessage } from 'discord-api-types/v9';

export function awaitComponent<
	T extends MessageComponentType | keyof typeof Constants['MessageComponentTypes'] = 'ACTION_ROW',
>(
	client: Client,
	message: Message | APIMessage,
	options: AwaitMessageCollectorOptionsParams<T> = {},
): Promise<MappedInteractionTypes[T]> {
	const _options = { ...options, max: 1 };
	return new Promise((resolve, reject) => {
		const collector = new InteractionCollector(client, {
			...(_options as unknown as CollectorFilter<[Interaction]>),
			interactionType: Constants.InteractionTypes.MESSAGE_COMPONENT,
			// @ts-expect-error D.JS hasn't update their dapi types
			message,
		});

		collector.once('end', (interactions, reason) => {
			const interaction = interactions.first();
			if (interaction) resolve(interaction as MappedInteractionTypes[T]);
			else reject(new Error(reason));
		});
	});
}

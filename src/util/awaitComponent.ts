import {
	Client,
	CollectorFilter,
	Interaction,
	InteractionCollector,
	Message,
	MessageComponentType,
	Constants,
	AwaitMessageCollectorOptionsParams,
	InteractionExtractor,
} from 'discord.js';
import type { APIMessage } from 'discord-api-types/v9';

export function awaitComponent<
	T extends MessageComponentType | keyof typeof Constants['MessageComponentTypes'] = 'ACTION_ROW',
>(
	client: Client,
	message: Message | APIMessage,
	options: AwaitMessageCollectorOptionsParams<T> = {},
): Promise<InteractionExtractor<T>> {
	const _options = { ...options, max: 1 };
	return new Promise((resolve, reject) => {
		const collector = new InteractionCollector(client, {
			...(_options as unknown as CollectorFilter<[Interaction]>),
			interactionType: Constants.InteractionTypes.MESSAGE_COMPONENT,
			message,
		});

		collector.once('end', (interactions, reason) => {
			const interaction = interactions.first();
			if (interaction) resolve(interaction as InteractionExtractor<T>);
			else reject(new Error(reason));
		});
	});
}

import type { APIMessage } from 'discord-api-types/v9';
import {
	type Client,
	type CollectorFilter,
	type Interaction,
	InteractionCollector,
	type Message,
	type AwaitMessageCollectorOptionsParams,
	type MappedInteractionTypes,
	InteractionType,
	ComponentType,
} from 'discord.js';

export function awaitComponent<T extends ComponentType = ComponentType.ActionRow>(
	client: Client,
	message: Message | APIMessage,
	options: AwaitMessageCollectorOptionsParams<T> = {},
): Promise<MappedInteractionTypes[T]> {
	const _options = { ...options, max: 1 };
	return new Promise((resolve, reject) => {
		const collector = new InteractionCollector(client, {
			...(_options as unknown as CollectorFilter<[Interaction]>),
			interactionType: InteractionType.MessageComponent,
			message,
		});

		collector.once('end', (interactions, reason) => {
			const interaction = interactions.first();
			if (interaction) resolve(interaction as MappedInteractionTypes[T]);
			else reject(new Error(reason));
		});
	});
}

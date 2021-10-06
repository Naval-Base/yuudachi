import {
	AwaitMessageComponentOptions,
	Client,
	CollectorFilter,
	Interaction,
	InteractionCollector,
	InteractionCollectorOptions,
	InteractionCollectorOptionsResolvable,
	Message,
	MessageComponentInteraction,
	MessageComponentType,
	Constants,
} from 'discord.js';
import type { APIMessage } from 'discord-api-types/v9';

// TODO: remove once exported from discord.js typings
// Monkey-patch types

type InteractionExtractor<T extends MessageComponentType | keyof typeof Constants['MessageComponentTypes']> = T extends
	| MessageComponentType
	| typeof Constants['MessageComponentTypes']
	? MappedInteractionCollectorOptions[T] extends InteractionCollectorOptions<infer Item>
		? Item
		: never
	: MessageComponentInteraction;

type MappedInteractionCollectorOptions = CollectorOptionsTypeResolver<InteractionCollectorOptionsResolvable>;

type CollectorOptionsTypeResolver<U extends InteractionCollectorOptionsResolvable> = {
	readonly [T in U['componentType']]: TaggedUnion<InteractionCollectorOptionsResolvable, 'componentType', T>;
};

type TaggedUnion<T, K extends keyof T, V extends T[K]> = T extends Record<K, V>
	? T
	: T extends Record<K, infer U>
	? V extends U
		? T
		: never
	: never;

type AwaitMessageCollectorOptionsParams<
	T extends MessageComponentType | keyof typeof Constants['MessageComponentTypes'],
> =
	| { componentType?: T } & Pick<
			InteractionCollectorOptions<InteractionExtractor<T>>,
			keyof AwaitMessageComponentOptions<any>
	  >;

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

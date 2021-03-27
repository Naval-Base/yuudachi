import {
	APIInteraction,
	APIInteractionResponse,
	APIMessage,
	APIInteractionApplicationCommandCallbackData,
	RESTPostAPIChannelMessageJSONBody,
	Routes,
} from 'discord-api-types/v8';
import Rest, { RequestOptions } from '@yuudachi/rest';
import { container } from 'tsyringe';

export async function send(
	message: APIMessage | APIInteraction,
	payload: RESTPostAPIChannelMessageJSONBody | APIInteractionApplicationCommandCallbackData,
	options: RequestOptions = {},
	type: APIInteractionResponse['type'] = 4,
) {
	const rest = container.resolve(Rest);

	if ('token' in message) {
		const { embed, ...r } = payload as RESTPostAPIChannelMessageJSONBody;
		const response = { ...r, embeds: embed ? [embed] : undefined };

		return rest.post(
			Routes.interactionCallback(message.id, message.token),
			{
				type,
				data: {
					...response,
				},
			},
			options,
		);
	}

	return rest.post(Routes.channelMessages(message.channel_id), payload, options);
}

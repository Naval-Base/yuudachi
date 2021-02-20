import {
	APIInteraction,
	APIInteractionResponse,
	APIMessage,
	APIInteractionApplicationCommandCallbackData,
	RESTPostAPIChannelMessageJSONBody,
	Routes,
} from 'discord-api-types/v8';
import Rest from '@yuudachi/rest';
import { container } from 'tsyringe';

export function edit(
	message: APIMessage | APIInteraction,
	payload: RESTPostAPIChannelMessageJSONBody | APIInteractionApplicationCommandCallbackData,
	type: APIInteractionResponse['type'] = 4,
) {
	const rest = container.resolve(Rest);

	if ('token' in message) {
		const { embed, ...r } = payload as RESTPostAPIChannelMessageJSONBody;
		const response = { ...r, embeds: embed ? [embed] : undefined };

		return rest.patch(Routes.webhookMessage(process.env.DISCORD_CLIENT_ID as `${bigint}`, message.token), {
			type,
			data: {
				...response,
			},
		});
	}

	return rest.patch(Routes.channelMessage(message.channel_id, message.id), payload);
}

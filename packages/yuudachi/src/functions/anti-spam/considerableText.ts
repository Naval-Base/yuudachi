import type { Message } from 'discord.js';
import { AUTOMOD_FLAG_INDICATOR_FIELD_NAME } from '../../Constants.js';

export function considerableText(message: Message) {
	if (message.author.bot || !message.inGuild()) {
		return null;
	}

	// @ts-expect-error Automod message, not yet in types (no overlap)
	if (message.type === 24) {
		const logEmbed = message.embeds[0]!;
		const isFlagged = logEmbed.fields.some((field) => field.name === AUTOMOD_FLAG_INDICATOR_FIELD_NAME);

		if (isFlagged) {
			return null;
		}

		return logEmbed.description;
	}

	if (!message.content.length) {
		return null;
	}

	return message.content;
}

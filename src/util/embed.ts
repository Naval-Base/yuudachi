import type { APIEmbed, APIEmbedField } from 'discord-api-types/v10';
import {
	EMBED_AUTHOR_NAME_LIMIT,
	EMBED_DESCRIPTION_LIMIT,
	EMBED_FIELD_LIMIT,
	EMBED_FIELD_NAME_LIMIT,
	EMBED_FIELD_VALUE_LIMIT,
	EMBED_FOOTER_TEXT_LIMIT,
	EMBED_TITLE_LIMIT,
} from '../Constants.js';

export function addFields(embed: APIEmbed, ...data: APIEmbedField[]): APIEmbed {
	return {
		...embed,
		fields: [...(embed.fields ?? []), ...data],
	};
}

export function ellipsis(text: string, total: number): string {
	if (text.length <= total) {
		return text;
	}
	const keep = total - 3;
	if (keep < 1) {
		return text.slice(0, total);
	}
	return `${text.slice(0, keep)}...`;
}

export function truncateEmbed(embed: APIEmbed): APIEmbed {
	return {
		...embed,
		description: embed.description ? ellipsis(embed.description, EMBED_DESCRIPTION_LIMIT) : undefined,
		title: embed.title ? ellipsis(embed.title, EMBED_TITLE_LIMIT) : undefined,
		author: embed.author
			? {
					...embed.author,
					name: ellipsis(embed.author.name, EMBED_AUTHOR_NAME_LIMIT),
			  }
			: undefined,
		footer: embed.footer
			? {
					...embed.footer,
					text: ellipsis(embed.footer.text, EMBED_FOOTER_TEXT_LIMIT),
			  }
			: undefined,
		fields: embed.fields
			? embed.fields
					.map((field) => ({
						name: ellipsis(field.name, EMBED_FIELD_NAME_LIMIT),
						value: ellipsis(field.value, EMBED_FIELD_VALUE_LIMIT),
					}))
					.slice(0, EMBED_FIELD_LIMIT)
			: [],
	};
}

export function truncate(text: string, len: number, splitChar = ' '): string {
	if (text.length <= len) return text;
	const words = text.split(splitChar);
	const res: string[] = [];
	for (const word of words) {
		const full = res.join(splitChar);
		if (full.length + word.length + 1 <= len - 3) {
			res.push(word);
		}
	}

	const resText = res.join(splitChar);
	return resText.length === text.length ? resText : `${resText.trim()}...`;
}

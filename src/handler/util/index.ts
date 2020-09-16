import { Embed, EmbedField } from '@spectacles/types';
import {
	EMBED_AUTHOR_NAME_LIMIT,
	EMBED_DESCRIPTION_LIMIT,
	EMBED_FIELD_LIMIT,
	EMBED_FIELD_NAME_LIMIT,
	EMBED_FIELD_VALUE_LIMIT,
	EMBED_FOOTER_TEXT_LIMIT,
	EMBED_TITLE_LIMIT,
} from '../Constants';

export function addField(embed: Embed, data: EmbedField): Embed {
	return {
		...embed,
		fields: [...(embed.fields ?? []), data],
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

export function truncateEmbed(embed: Embed): Embed {
	return {
		description: embed.description ? ellipsis(embed.description, EMBED_DESCRIPTION_LIMIT) : undefined,
		title: embed.title ? ellipsis(embed.title, EMBED_TITLE_LIMIT) : undefined,
		author: embed.author
			? {
					...embed.author,
					name: embed.author.name ? ellipsis(embed.author.name, EMBED_AUTHOR_NAME_LIMIT) : undefined,
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
					.map((field) => {
						return {
							name: ellipsis(field.name, EMBED_FIELD_NAME_LIMIT),
							value: ellipsis(field.value, EMBED_FIELD_VALUE_LIMIT),
						};
					})
					.slice(0, EMBED_FIELD_LIMIT)
			: [],
	};
}

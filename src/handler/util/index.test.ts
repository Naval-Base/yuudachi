import { ellipsis, truncateEmbed, addField } from '.';
import {
	EMBED_AUTHOR_NAME_LIMIT,
	EMBED_DESCRIPTION_LIMIT,
	EMBED_FIELD_LIMIT,
	EMBED_FIELD_NAME_LIMIT,
	EMBED_FIELD_VALUE_LIMIT,
	EMBED_FOOTER_TEXT_LIMIT,
	EMBED_TITLE_LIMIT,
} from '../Constants';

describe('ellipsis', () => {
	const text = 'lorem ipsum';

	test('text shorter than total', () => {
		expect(ellipsis(text, 20)).toBe(text);
	});

	test('text longer than total and total < 4', () => {
		expect(ellipsis(text, 0)).toBe('');
		expect(ellipsis(text, 1)).toBe('l');
		expect(ellipsis(text, 2)).toBe('lo');
		expect(ellipsis(text, 3)).toBe('lor');
	});

	test('text longer than total', () => {
		expect(ellipsis(text, 7)).toBe('lore...');
	});
});

describe('addField', () => {
	test('no fields', () => {
		const embed = {};
		const added = addField(embed, { name: 'foo', value: 'bar' });
		expect(added.fields.length).toBe(1);
		const addedField = added.fields[0];
		expect(addedField.name).toBe('foo');
		expect(addedField.value).toBe('bar');
	});

	test('has fields', () => {
		const embed = {
			fields: [
				{
					name: 'foo',
					value: 'bar',
				},
			],
		};
		const added = addField(embed, { name: 'newFieldName', value: 'newFieldValue' });
		expect(added.fields.length).toBe(2);
		const oldField = added.fields[0];
		const newField = added.fields[1];
		expect(oldField.name).toBe('foo');
		expect(oldField.value).toBe('bar');
		expect(newField.name).toBe('newFieldName');
		expect(newField.value).toBe('newFieldValue');
	});
});

describe('truncateEmbed', () => {
	test('truncate description', () => {
		const embed = {
			description: 'a'.repeat(EMBED_DESCRIPTION_LIMIT + 1),
		};
		expect(truncateEmbed(embed).description.length).toBeLessThanOrEqual(EMBED_DESCRIPTION_LIMIT);
	});

	test('truncate title', () => {
		const embed = {
			title: 'a'.repeat(EMBED_TITLE_LIMIT + 1),
		};
		expect(truncateEmbed(embed).title.length).toBeLessThanOrEqual(EMBED_TITLE_LIMIT);
	});

	test('truncate author name', () => {
		const embed = {
			author: {
				name: 'a'.repeat(EMBED_AUTHOR_NAME_LIMIT + 1),
				icon_url: 'foo.bar.jpg',
				url: 'foo.bar',
			},
			description: 'foo bar',
		};
		const truncated = truncateEmbed(embed);
		expect(truncated.author.name.length).toBeLessThanOrEqual(EMBED_AUTHOR_NAME_LIMIT);
		expect(truncated.author.icon_url).toBe(embed.author.icon_url);
		expect(truncated.author.url).toBe(embed.author.url);
		expect(truncated.description).toBe(embed.description);
	});

	test('truncate description, author no name', () => {
		const embed = {
			author: {
				icon_url: 'foo.bar.jpg',
				url: 'foo.bar',
			},
			description: 'a'.repeat(EMBED_DESCRIPTION_LIMIT + 1),
		};
		expect(truncateEmbed(embed).description.length).toBeLessThanOrEqual(EMBED_DESCRIPTION_LIMIT);
		expect(truncateEmbed(embed).author.name).toBe(undefined);
	});

	test('truncate footer text', () => {
		const embed = {
			footer: {
				text: 'a'.repeat(EMBED_FOOTER_TEXT_LIMIT + 1),
				icon_url: 'foo.bar.jpg',
			},
			description: 'foo bar',
		};
		const truncated = truncateEmbed(embed);
		expect(truncated.footer.text.length).toBeLessThanOrEqual(EMBED_FOOTER_TEXT_LIMIT);
		expect(truncated.footer.icon_url).toBe(embed.footer.icon_url);
		expect(truncated.description).toBe(embed.description);
	});

	test('truncate field value and name', () => {
		const embed = {
			fields: [
				{
					name: 'a'.repeat(EMBED_FIELD_NAME_LIMIT + 1),
					value: 'b'.repeat(EMBED_FIELD_VALUE_LIMIT + 1),
				},
			],
		};
		const truncated = truncateEmbed(embed);
		const truncField = truncated.fields[0];
		expect(truncField.name.length).toBeLessThanOrEqual(EMBED_FIELD_NAME_LIMIT);
		expect(truncField.value.length).toBeLessThanOrEqual(EMBED_FIELD_VALUE_LIMIT);
	});

	test('truncate fields', () => {
		const field = {
			name: 'foo',
			value: 'bar',
		};
		const fields = new Array(EMBED_FIELD_LIMIT + 1).fill(field);
		const embed = {
			fields,
			description: 'foo bar',
		};
		const truncated = truncateEmbed(embed);
		expect(truncated.fields.length).toBeLessThanOrEqual(EMBED_FIELD_LIMIT);
		expect(truncated.description).toBe(embed.description);
	});
});

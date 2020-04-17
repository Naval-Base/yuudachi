import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { MESSAGES } from '../../util/constants';
import { GRAPHQL, graphQLClient } from '../../util/graphQL';
import { Tags } from '../../util/graphQLTypes';

export default class TagAliasCommand extends Command {
	public constructor() {
		super('tag-alias', {
			category: 'tag',
			description: {
				content: MESSAGES.COMMANDS.TAGS.ALIAS.DESCRIPTION,
				usage: '<--add/--del> <tag> <tagalias>',
				examples: ['--add Test1 Test2', '--del "Test 2" "Test 3"', '"Test 3" "Test 4" --add'],
			},
			channel: 'guild',
			ratelimit: 2,
			flags: ['--add', '--del'],
		});
	}

	public *args() {
		const first = yield {
			type: 'tag',
			prompt: {
				start: (message: Message) => MESSAGES.COMMANDS.TAGS.ALIAS.PROMPT.START(message.author),
				retry: (message: Message, { failure }: { failure: { value: string } }) =>
					MESSAGES.COMMANDS.TAGS.ALIAS.PROMPT.RETRY(message.author, failure.value),
			},
		};

		const add = yield {
			match: 'flag',
			flag: '--add',
		};

		const del = yield {
			match: 'flag',
			flag: '--del',
		};

		const second = yield add
			? {
					match: 'rest',
					type: 'existingTag',
					prompt: {
						start: (message: Message) => MESSAGES.COMMANDS.TAGS.ALIAS.PROMPT_2.START(message.author),
						retry: (message: Message, { failure }: { failure: { value: string } }) =>
							MESSAGES.COMMANDS.TAGS.ALIAS.PROMPT_2.RETRY(message.author, failure.value),
					},
			  }
			: {
					match: 'rest',
					type: 'string',
					prompt: {
						start: (message: Message) => MESSAGES.COMMANDS.TAGS.ALIAS.PROMPT_3.START(message.author),
						retry: (message: Message, { failure }: { failure: { value: string } }) =>
							MESSAGES.COMMANDS.TAGS.ALIAS.PROMPT_3.RETRY(message.author, failure.value),
					},
			  };

		return { first, second, add, del };
	}

	public async exec(
		message: Message,
		{ first, second, add, del }: { first: Tags; second: string; add: boolean; del: boolean },
	) {
		const secondArr = second.split(',');
		secondArr.forEach((s) => s.trim());
		if (add) {
			if (secondArr.length && secondArr.some((s) => s.length >= 1900)) {
				return message.util?.reply(MESSAGES.COMMANDS.TAGS.ALIAS.TOO_LONG);
			}
			first.aliases.push(...secondArr);
		} else if (del) {
			secondArr.forEach((s) => {
				const index = first.aliases.indexOf(s);
				first.aliases.splice(index, 1);
			});
		} else {
			return message.util?.reply('you have to either supply `--add` or `--del.`');
		}
		await graphQLClient.mutate({
			mutation: GRAPHQL.MUTATION.UPDATE_TAG_ALIASES,
			variables: {
				id: first.id,
				aliases: `{${first.aliases.join(',')}}`,
				lastModified: message.author.id,
			},
		});

		return message.util?.reply(
			MESSAGES.COMMANDS.TAGS.ALIAS.REPLY(first.name, secondArr.join(',').substring(0, 1900), add),
		);
	}
}

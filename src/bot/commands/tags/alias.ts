import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { MESSAGES, SETTINGS } from '../../util/constants';
import { GRAPHQL, graphQLClient } from '../../util/graphQL';
import { Tags } from '../../util/graphQLTypes';

export default class TagAliasCommand extends Command {
	public constructor() {
		super('tag-alias', {
			category: 'tags',
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

	// @ts-ignore
	public userPermissions(message: Message) {
		const restrictedRoles = this.client.settings.get(message.guild!, SETTINGS.RESTRICT_ROLES);
		if (!restrictedRoles) return null;
		const hasRestrictedRole = message.member!.roles.has(restrictedRoles.TAG);
		if (hasRestrictedRole) return 'Restricted';
		return null;
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
		if (add) {
			if (second && second.length >= 1900) {
				return message.util!.reply(MESSAGES.COMMANDS.TAGS.ALIAS.TOO_LONG);
			}
			first.aliases.push(second);
		} else if (del) {
			const index = first.aliases.indexOf(second);
			first.aliases.splice(index, 1);
		} else {
			return message.util!.reply('you have to either supply `--add` or `--del.`');
		}
		await graphQLClient.mutate({
			mutation: GRAPHQL.MUTATION.UPDATE_TAG_ALIASES,
			variables: {
				id: first.id,
				aliases: `{${first.aliases.join(',')}}`,
				last_modified: message.author.id,
			},
		});

		return message.util!.reply(MESSAGES.COMMANDS.TAGS.ALIAS.REPLY(first.name, second.substring(0, 1900), add));
	}
}

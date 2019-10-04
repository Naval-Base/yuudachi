import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { MESSAGES, SETTINGS } from '../../util/constants';
import { GRAPHQL, graphQLClient } from '../../util/graphQL';

export default class TagAddCommand extends Command {
	public constructor() {
		super('tag-add', {
			category: 'tags',
			description: {
				content: MESSAGES.COMMANDS.TAGS.ADD.DESCRIPTION,
				usage: '[--hoisted] <tag> <content>',
				examples: ['Test Test', '--hoisted "Test 2" Test2', '"Test 3" "Some more text" --hoisted'],
			},
			channel: 'guild',
			ratelimit: 2,
			args: [
				{
					id: 'name',
					type: 'existingTag',
					prompt: {
						start: (message: Message) => MESSAGES.COMMANDS.TAGS.ADD.PROMPT.START(message.author),
						retry: (message: Message, { failure }: { failure: { value: string } }) =>
							MESSAGES.COMMANDS.TAGS.ADD.PROMPT.RETRY(message.author, failure.value),
					},
				},
				{
					id: 'content',
					match: 'rest',
					type: 'tagContent',
					prompt: {
						start: (message: Message) => MESSAGES.COMMANDS.TAGS.ADD.PROMPT_2.START(message.author),
					},
				},
				{
					id: 'hoist',
					match: 'flag',
					flag: ['--hoist', '--pin'],
				},
				{
					id: 'template',
					match: 'flag',
					flag: ['--template'],
				},
			],
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

	public async exec(
		message: Message,
		{ name, content, hoist, templated }: { name: string; content: string; hoist: boolean; templated: boolean },
	) {
		if (name && name.length >= 1900) {
			return message.util!.reply(MESSAGES.COMMANDS.TAGS.ADD.TOO_LONG);
		}
		if (content && content.length >= 1950) {
			return message.util!.reply(MESSAGES.COMMANDS.TAGS.ADD.TOO_LONG);
		}
		const staffRole = message.member!.roles.has(this.client.settings.get(message.guild!, SETTINGS.MOD_ROLE));
		await graphQLClient.mutate({
			mutation: GRAPHQL.MUTATION.INSERT_TAG,
			variables: {
				guild: message.guild!.id,
				user: message.author!.id,
				name,
				hoisted: hoist && staffRole,
				templated: templated && staffRole,
				content,
			},
		});

		return message.util!.reply(MESSAGES.COMMANDS.TAGS.ADD.REPLY(name.substring(0, 1900)));
	}
}

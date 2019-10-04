import { Command } from 'discord-akairo';
import { Message, Util } from 'discord.js';
import { MESSAGES, SETTINGS } from '../../util/constants';
import { GRAPHQL, graphQLClient } from '../../util/graphQL';
import { Tags } from '../../util/graphQLTypes';

export default class TagEditCommand extends Command {
	public constructor() {
		super('tag-edit', {
			category: 'tags',
			description: {
				content: MESSAGES.COMMANDS.TAGS.EDIT.DESCRIPTION,
				usage: '<tag> [--hoist/--unhoist/--pin/--unpin] <content>',
				examples: ['Test Some new content', '"Test 1" Some more new content', 'Test --hoist', '"Test 1" --unpin'],
			},
			channel: 'guild',
			ratelimit: 2,
			flags: ['--hoist', '--pin', '--unhoist', '--unpin', '--template', '--untemplate'],
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
		const tag = yield {
			type: 'tag',
			prompt: {
				start: (message: Message) => MESSAGES.COMMANDS.TAGS.EDIT.PROMPT.START(message.author),
				retry: (message: Message, { failure }: { failure: { value: string } }) =>
					MESSAGES.COMMANDS.TAGS.EDIT.PROMPT.RETRY(message.author, failure.value),
			},
		};

		const hoist = yield {
			match: 'flag',
			flag: ['--hoist', '--pin'],
		};

		const unhoist = yield {
			match: 'flag',
			flag: ['--unhoist', '--unpin'],
		};

		const template = yield {
			match: 'flag',
			flag: ['--template'],
		};

		const untemplate = yield {
			match: 'flag',
			flag: ['--untemplate'],
		};

		const content = yield hoist || unhoist
			? {
					match: 'rest',
					type: 'string',
			  }
			: {
					match: 'rest',
					type: 'string',
					prompt: {
						start: (message: Message) => MESSAGES.COMMANDS.TAGS.EDIT.PROMPT_2.START(message.author),
					},
			  };

		return { tag, hoist, unhoist, template, untemplate, content };
	}

	public async exec(
		message: Message,
		{
			tag,
			hoist,
			unhoist,
			template,
			untemplate,
			content,
		}: { tag: Tags; hoist: boolean; unhoist: boolean; template: boolean; untemplate: boolean; content: string },
	) {
		const staffRole = message.member!.roles.has(this.client.settings.get(message.guild!, SETTINGS.MOD_ROLE));
		if (tag.user !== message.author!.id && !staffRole) {
			return message.util!.reply(MESSAGES.COMMANDS.TAGS.EDIT.OWN_TAG);
		}
		if (content && content.length >= 1950) {
			return message.util!.reply(MESSAGES.COMMANDS.TAGS.EDIT.TOO_LONG);
		}
		if (content && (!staffRole || !template || untemplate)) {
			content = Util.cleanContent(content, message);
			if (message.attachments.first()) content += `\n${message.attachments.first()!.url}`;
		}
		if (hoist) hoist = true;
		else if (unhoist) hoist = false;
		const vars = content
			? {
					id: tag.id,
					hoisted: staffRole && (hoist || unhoist) ? hoist : tag.hoisted,
					templated: staffRole && (template || untemplate) ? template : tag.templated,
					content,
					last_modified: message.author!.id,
			  }
			: {
					id: tag.id,
					hoisted: staffRole && (hoist || unhoist) ? hoist : tag.hoisted,
					templated: staffRole && (template || untemplate) ? template : tag.templated,
					last_modified: message.author!.id,
			  };
		await graphQLClient.mutate({
			mutation: content ? GRAPHQL.MUTATION.UPDATE_TAG_CONTENT : GRAPHQL.MUTATION.UPDATE_TAG_HOIST,
			variables: vars,
		});

		return message.util!.reply(MESSAGES.COMMANDS.TAGS.EDIT.REPLY(tag.name, hoist, staffRole));
	}
}

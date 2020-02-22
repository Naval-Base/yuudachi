import { Command } from 'discord-akairo';
import { Message, Util } from 'discord.js';
import { MESSAGES, SETTINGS } from '../../util/constants';
import { GRAPHQL, graphQLClient } from '../../util/graphQL';
import { Tags, TagsSetInput } from '../../util/graphQLTypes';
import { interpolateString } from '../../util/template';

export default class TagEditCommand extends Command {
	public constructor() {
		super('tag-edit', {
			category: 'tag',
			description: {
				content: MESSAGES.COMMANDS.TAGS.EDIT.DESCRIPTION,
				usage: '<tag> [--hoist/--unhoist/--pin/--unpin/--template/--untemplate] <content>',
				examples: ['Test Some new content', '"Test 1" Some more new content', 'Test --hoist', '"Test 1" --unpin'],
			},
			channel: 'guild',
			ratelimit: 2,
			flags: ['--hoist', '--pin', '--unhoist', '--unpin', '--template', '--untemplate'],
		});
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

		const content = yield hoist || unhoist || template || untemplate
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
		const staffRole =
			message.member?.roles.cache.has(this.client.settings.get(message.guild!, SETTINGS.MOD_ROLE)) ?? false;
		if (tag.user !== message.author.id && !staffRole) {
			return message.util?.reply(MESSAGES.COMMANDS.TAGS.EDIT.OWN_TAG);
		}
		if (content?.length >= 1950) {
			return message.util?.reply(MESSAGES.COMMANDS.TAGS.EDIT.TOO_LONG);
		}
		if (content && (!staffRole || !template || untemplate)) {
			content = Util.cleanContent(content, message);
			if (message.attachments.first()) content += `\n${message.attachments.first()?.url ?? ''}`;
		}

		const templated = staffRole && (template || untemplate) ? template : tag.templated;
		const vars = content
			? {
					id: tag.id,
					hoisted: staffRole && (hoist || unhoist) ? hoist : tag.hoisted,
					templated,
					content,
					lastModified: message.author.id,
			  }
			: {
					id: tag.id,
					hoisted: staffRole && (hoist || unhoist) ? hoist : tag.hoisted,
					templated,
					lastModified: message.author.id,
			  };

		if (templated) {
			try {
				interpolateString(content, {
					author: message.author.toString(),
					channel: message.channel.toString(),
					guild: message.guild ? message.guild.toString() : null,
				});
			} catch (error) {
				return message.channel.send(error);
			}
		}

		await graphQLClient.mutate<any, TagsSetInput>({
			mutation: content ? GRAPHQL.MUTATION.UPDATE_TAG_CONTENT : GRAPHQL.MUTATION.UPDATE_TAG_HOIST,
			variables: vars,
		});

		return message.util?.reply(
			MESSAGES.COMMANDS.TAGS.EDIT.REPLY(
				tag.name,
				staffRole && (hoist || unhoist),
				staffRole && (template || untemplate),
			),
		);
	}
}

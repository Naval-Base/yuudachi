import { injectable } from 'tsyringe';
import type { APIGuildInteraction } from 'discord-api-types/v8';
import { CommandModules } from '@yuudachi/types';
import type { ArgumentsOf, TagsCommand } from '@yuudachi/interactions';

import Command from '../../Command';
import { search } from './sub/search';

@injectable()
export default class implements Command {
	public readonly category = CommandModules.Tags;

	public execute(message: APIGuildInteraction, args: ArgumentsOf<typeof TagsCommand>, locale: string) {
		switch (Object.keys(args)[0]) {
			case 'search': {
				return search(message, args.search.query, locale);
			}
		}
	}
}

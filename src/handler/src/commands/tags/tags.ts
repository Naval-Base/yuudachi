import { injectable } from 'tsyringe';
import type { APIGuildInteraction } from 'discord-api-types';
import { CommandModules } from '@yuudachi/types';
import type { TransformedInteraction } from '@yuudachi/interactions';

import Command from '../../Command';
import { search } from './sub/search';

@injectable()
export default class implements Command {
	public readonly category = CommandModules.Tags;

	public execute(message: APIGuildInteraction, args: TransformedInteraction, locale: string) {
		switch (Object.keys(args.tags)[0]) {
			case 'search': {
				return search(message, args.tags.search.query, locale);
			}
		}
	}
}

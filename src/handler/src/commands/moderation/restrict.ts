import type { APIGuildInteraction } from 'discord-api-types/v8';
import { injectable } from 'tsyringe';
import { CommandModules } from '@yuudachi/types';
import type { ArgumentsOf, RestrictCommand } from '@yuudachi/interactions';

import Command from '../../Command';
import { checkMod } from '../../util';

import { mute } from './sub/restrict/mute';
import { embed } from './sub/restrict/embed';
import { react } from './sub/restrict/react';
import { emoji } from './sub/restrict/emoji';
import { tag } from './sub/restrict/tag';
import { unrole } from './sub/restrict/unrole';

@injectable()
export default class implements Command {
	public readonly category = CommandModules.Moderation;

	public async execute(message: APIGuildInteraction, args: ArgumentsOf<typeof RestrictCommand>, locale: string) {
		await checkMod(message, locale);

		switch (Object.keys(args)[0]) {
			case 'mute': {
				return mute(message, args.mute, locale);
			}

			case 'embed': {
				return embed(message, args.embed, locale);
			}

			case 'react': {
				return react(message, args.react, locale);
			}

			case 'emoji': {
				return emoji(message, args.emoji, locale);
			}

			case 'tag': {
				return tag(message, args.tag, locale);
			}

			case 'unrole': {
				return unrole(message, args.unrole, locale);
			}
		}
	}
}

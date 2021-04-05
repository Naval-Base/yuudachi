import type { APIGuildInteraction } from 'discord-api-types/v8';
import { injectable } from 'tsyringe';
import { CommandModules } from '@yuudachi/types';
import type { TransformedInteraction } from '@yuudachi/interactions';

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

	public async execute(message: APIGuildInteraction, args: TransformedInteraction, locale: string) {
		await checkMod(message, locale);

		switch (Object.keys(args.restrict)[0]) {
			case 'mute': {
				return mute(message, args.restrict.mute, locale);
			}

			case 'embed': {
				return embed(message, args.restrict.embed, locale);
			}

			case 'react': {
				return react(message, args.restrict.react, locale);
			}

			case 'emoji': {
				return emoji(message, args.restrict.emoji, locale);
			}

			case 'tag': {
				return tag(message, args.restrict.tag, locale);
			}

			case 'unrole': {
				return unrole(message, args.restrict.unrole, locale);
			}
		}
	}
}

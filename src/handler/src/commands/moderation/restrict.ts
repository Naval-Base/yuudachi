import type { APIGuildInteraction } from 'discord-api-types/v8';
import i18next from 'i18next';
import { injectable } from 'tsyringe';
import { CommandModules, TransformedInteraction } from '@yuudachi/types';

import Command from '../../Command';
import { checkMod, send } from '../../util';

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

			default: {
				void send(message, {
					content: i18next.t('command.common.errors.no_valid_sub_command', { lng: locale }),
					flags: 64,
				});
				break;
			}
		}
	}
}

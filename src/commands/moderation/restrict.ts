import type { CommandInteraction } from 'discord.js';

import type { ArgumentsOf } from '../../interactions/ArgumentsOf';
import type { Command } from '../../Command';
import type { RestrictCommand } from '../../interactions';
import { checkModRole } from '../../util/checkModRole';

import { unrole } from './sub/restrict/unrole';

export default class implements Command {
	public async execute(
		interaction: CommandInteraction,
		args: ArgumentsOf<typeof RestrictCommand>,
		locale: string,
	): Promise<void> {
		await interaction.defer({ ephemeral: true });
		await checkModRole(interaction, locale);

		switch (Object.keys(args)[0]) {
			/* case 'mute': {
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
			} */

			case 'unrole': {
				return unrole(interaction, args.unrole, locale);
			}
		}
	}
}

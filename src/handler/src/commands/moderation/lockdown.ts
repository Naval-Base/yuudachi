import type { APIGuildInteraction } from 'discord-api-types/v8';
import i18next from 'i18next';
import { injectable } from 'tsyringe';
import { CommandModules, TransformedInteraction } from '@yuudachi/types';

import Command from '../../Command';
import { checkMod, send } from '../../util';

import { lock } from './sub/lockdown/lock';
import { lift } from './sub/lockdown/lift';

@injectable()
export default class implements Command {
	public readonly category = CommandModules.Moderation;

	public async execute(message: APIGuildInteraction, args: TransformedInteraction, locale: string) {
		await checkMod(message, locale);

		switch (Object.keys(args.lockdown)[0]) {
			case 'lock': {
				const reason = args.lockdown.lock.reason;
				if (reason.length >= 1900) {
					throw new Error(i18next.t('command.mod.common.errors.max_length_reason', { lng: locale }));
				}
				return lock(message, args.lockdown.lock.channel.id, args.lockdown.lock.duration, reason, locale);
			}

			case 'lift': {
				return lift(message, args.lockdown.lock.channel.id, locale);
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

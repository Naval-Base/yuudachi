import { injectable } from 'tsyringe';
import { APIInteraction, APIMessage } from 'discord-api-types';
import { Args } from 'lexure';
import i18next from 'i18next';

import Command from '../../Command';
import { CommandModules } from '../../Constants';

import { refresh } from './sub/debug/refresh';

@injectable()
export default class implements Command {
	public readonly category = CommandModules.Config;

	public async execute(message: APIMessage | APIInteraction, args: Args, locale: string) {
		if (!message.guild_id) {
			throw new Error(i18next.t('command.common.errors.no_guild', { lng: locale }));
		}

		const sub = args.single();
		if (!sub) {
			throw new Error(i18next.t('command.common.errors.no_sub_command', { lng: locale }));
		}

		switch (sub) {
			case 'refresh': {
				return refresh(message, args, locale);
			}

			default:
				break;
		}
	}
}

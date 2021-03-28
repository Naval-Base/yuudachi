import { injectable } from 'tsyringe';
import type { APIGuildInteraction, APIMessage } from 'discord-api-types/v8';
import type { Args } from 'lexure';
import i18next from 'i18next';
import { CommandModules } from '@yuudachi/types';

import Command from '../../Command';

import { refresh } from './sub/debug/refresh';
import { checkMod } from '../../util';

@injectable()
export default class implements Command {
	public readonly category = CommandModules.Config;

	public async execute(message: APIMessage | APIGuildInteraction, args: Args, locale: string) {
		if (!message.guild_id) {
			throw new Error(i18next.t('command.common.errors.no_guild', { lng: locale }));
		}
		await checkMod(message, locale);

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

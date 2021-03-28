import { injectable } from 'tsyringe';
import type { APIGuildInteraction, APIMessage } from 'discord-api-types/v8';
import type { Args } from 'lexure';
import i18next from 'i18next';
import { CommandModules } from '@yuudachi/types';

import Command from '../../Command';
import { send } from '../../util';

@injectable()
export default class implements Command {
	public readonly category = CommandModules.Utility;

	private parse(args: Args) {
		return args.flag('hide');
	}

	public execute(message: APIMessage | APIGuildInteraction, args: Args, locale: string) {
		const hide = this.parse(args);

		void send(message, {
			content: i18next.t('command.utility.ping.success', { lng: locale }),
			flags: hide ? 64 : undefined,
		});
	}
}

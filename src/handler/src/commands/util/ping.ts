import { injectable } from 'tsyringe';
import { APIInteraction, APIMessage } from 'discord-api-types/v8';
import { Args } from 'lexure';
import i18next from 'i18next';

import Command from '../../Command';
import { CommandModules } from '../../Constants';
import { send } from '../../util';

@injectable()
export default class implements Command {
	public readonly category = CommandModules.Utility;

	private parse(args: Args) {
		return args.flag('hide');
	}

	public execute(message: APIMessage | APIInteraction, args: Args, locale: string) {
		const hide = this.parse(args);

		void send(
			message,
			{
				content: i18next.t('command.utility.ping.success', { lng: locale }),
				flags: hide ? 64 : undefined,
			},
			hide ? 3 : 4,
		);
	}
}

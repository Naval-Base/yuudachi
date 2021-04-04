import { injectable } from 'tsyringe';
import type { APIGuildInteraction } from 'discord-api-types/v8';
import i18next from 'i18next';
import { CommandModules, TransformedInteraction } from '@yuudachi/types';

import Command from '../../Command';
import { send } from '../../util';

@injectable()
export default class implements Command {
	public readonly category = CommandModules.Utility;

	public execute(message: APIGuildInteraction, args: TransformedInteraction, locale: string) {
		void send(message, {
			content: i18next.t('command.utility.ping.success', { lng: locale }),
			flags: args.ping.hide ? 64 : undefined,
		});
	}
}

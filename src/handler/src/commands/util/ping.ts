import { injectable } from 'tsyringe';
import { APIMessage, Routes } from 'discord-api-types';
import { Args } from 'lexure';
import Rest from '@yuudachi/rest';
import i18next from 'i18next';

import Command from '../../Command';
import { CommandModules } from '../../Constants';

@injectable()
export default class implements Command {
	public readonly category = CommandModules.Utility;

	public constructor(private readonly rest: Rest) {}

	public async execute(message: APIMessage, _: Args, locale: string) {
		const msg: APIMessage = await this.rest.post(Routes.channelMessages(message.channel_id), {
			content: i18next.t('command.utility.ping.pre_ping', { lng: locale }),
		});
		void this.rest.patch(Routes.channelMessage(message.channel_id, msg.id), {
			content: i18next.t('command.utility.ping.post_ping', {
				ping:
					Date.parse(msg.edited_timestamp ?? msg.timestamp) - Date.parse(message.edited_timestamp ?? message.timestamp),
				lng: locale,
			}),
		});
	}
}

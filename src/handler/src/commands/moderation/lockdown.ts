import { APIInteraction, APIMessage } from 'discord-api-types';
import i18next from 'i18next';
import { Args, joinTokens, ok } from 'lexure';
import { injectable } from 'tsyringe';

import Command from '../../Command';
import parseChannel from '../../parsers/channel';
import { CommandModules } from '../../Constants';
import { send } from '../../util';

import { lock } from './sub/lockdown/lock';
import { lift } from './sub/lockdown/lift';

@injectable()
export default class implements Command {
	public readonly category = CommandModules.Moderation;

	private parse(args: Args) {
		const channel = args.option('channel');
		const duration = args.option('duration');
		const reason = args.option('reason');

		return {
			sub: args.single(),
			maybeChannel: channel ? parseChannel(channel) : args.singleParse(parseChannel),
			duration: duration ?? args.single(),
			reason: reason ?? joinTokens(args.many()),
		};
	}

	public execute(message: APIMessage | APIInteraction, args: Args, locale: string) {
		if (!message.guild_id) {
			throw new Error(i18next.t('command.common.errors.no_guild', { lng: locale }));
		}

		let { sub, maybeChannel, duration, reason } = this.parse(args);
		if (!sub) {
			throw new Error(i18next.t('command.common.errors.no_sub_command', { lng: locale }));
		}
		if (!maybeChannel) {
			maybeChannel = ok(message.channel_id);
		}
		if (!maybeChannel.success) {
			throw new Error(i18next.t('command.common.errors.invalid_channel_id', { lng: locale, id: maybeChannel.error }));
		}

		switch (sub) {
			case 'lock': {
				if (!duration) {
					throw new Error(i18next.t('command.mod.common.errors.no_duration', { lng: locale }));
				}
				return lock(message, maybeChannel, duration, reason, locale);
			}

			case 'lift': {
				return lift(message, maybeChannel, locale);
			}

			default: {
				void send(message, {}, 2);
				break;
			}
		}
	}
}

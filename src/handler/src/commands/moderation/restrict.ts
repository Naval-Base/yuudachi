import { APIInteraction, APIMessage } from 'discord-api-types/v8';
import i18next from 'i18next';
import { Args, joinTokens, Ok } from 'lexure';
import { injectable } from 'tsyringe';

import Command from '../../Command';
import parseMember from '../../parsers/member';
import { CommandModules } from '../../Constants';
import { send } from '../../util';

import { mute } from './sub/restrict/mute';
import { embed } from './sub/restrict/embed';
import { react } from './sub/restrict/react';
import { emoji } from './sub/restrict/emoji';
import { tag } from './sub/restrict/tag';
import { unrole } from './sub/restrict/unrole';

@injectable()
export default class implements Command {
	public readonly category = CommandModules.Moderation;

	private parse(args: Args) {
		const user = args.option('user');
		const duration = args.option('duration');
		// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
		const reason = args.option('reason') || undefined;
		const refId = args.option('reference', 'ref');

		const sub = args.single();
		if (sub === 'unrole') {
			const caseId = args.option('case');
			return {
				sub,
				caseId: caseId ?? args.single(),
			};
		}

		return {
			sub,
			maybeMember: user ? parseMember(user) : args.singleParse(parseMember),
			duration: duration ?? args.single(),
			reason: reason ?? joinTokens(args.many()),
			refId: refId ?? undefined,
		};
	}

	public async execute(message: APIMessage | APIInteraction, args: Args, locale: string) {
		if (!message.guild_id) {
			throw new Error(i18next.t('command.common.errors.no_guild', { lng: locale }));
		}

		const { sub, maybeMember, duration, reason, refId, caseId } = this.parse(args);
		if (!sub) {
			throw new Error(i18next.t('command.common.errors.no_sub_command', { lng: locale }));
		}
		if (sub === 'unrole') {
			if (!caseId) {
				throw new Error(i18next.t('command.mod.common.errors.no_case_id'));
			}
		} else {
			if (!maybeMember) {
				throw new Error(i18next.t('command.common.errors.no_user_id', { lng: locale }));
			}
			if (!maybeMember.success) {
				throw new Error(i18next.t('command.common.errors.invalid_user_id', { lng: locale, id: maybeMember.error }));
			}
			if (!duration) {
				throw new Error(i18next.t('command.mod.common.errors.no_duration', { lng: locale }));
			}
		}

		switch (sub) {
			case 'mute': {
				return mute(message, maybeMember as Ok<string>, duration as string, locale, reason, refId);
			}

			case 'embed': {
				return embed(message, maybeMember as Ok<string>, duration as string, locale, reason, refId);
			}

			case 'react': {
				return react(message, maybeMember as Ok<string>, duration as string, locale, reason, refId);
			}

			case 'emoji': {
				return emoji(message, maybeMember as Ok<string>, duration as string, locale, reason, refId);
			}

			case 'tag': {
				return tag(message, maybeMember as Ok<string>, duration as string, locale, reason, refId);
			}

			case 'unrole': {
				return unrole(message, caseId!, locale);
			}

			default: {
				void send(message, {}, 2);
				break;
			}
		}
	}
}

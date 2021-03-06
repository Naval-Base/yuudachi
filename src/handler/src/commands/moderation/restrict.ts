import { APIInteraction, APIMessage } from 'discord-api-types/v8';
import i18next from 'i18next';
import { Args, joinTokens, Ok } from 'lexure';
import { inject, injectable } from 'tsyringe';
import { Sql } from 'postgres';
import { Tokens } from '@yuudachi/core';
import { CommandModules } from '@yuudachi/types';

import Command from '../../Command';
import parseMember from '../../parsers/member';
import { send } from '../../util';

import { mute } from './sub/restrict/mute';
import { embed } from './sub/restrict/embed';
import { react } from './sub/restrict/react';
import { emoji } from './sub/restrict/emoji';
import { tag } from './sub/restrict/tag';
import { unrole } from './sub/restrict/unrole';

const { kSQL } = Tokens;

@injectable()
export default class implements Command {
	public readonly category = CommandModules.Moderation;

	public constructor(@inject(kSQL) private readonly sql: Sql<any>) {}

	private parse(args: Args) {
		const user = args.option('user');
		const duration = args.option('duration');
		const reason = args.option('reason');
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
			reason: reason ?? (joinTokens(args.many()) || undefined),
			refId: refId ?? undefined,
		};
	}

	public async execute(message: APIMessage | APIInteraction, args: Args, locale: string) {
		if (!message.guild_id) {
			throw new Error(i18next.t('command.common.errors.no_guild', { lng: locale }));
		}

		const [data] = await this.sql<{ mod_role_id: `${bigint}` | null }[]>`
			select mod_role_id
			from guild_settings
			where guild_id = ${message.guild_id}`;

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (!message.member?.roles.includes(data?.mod_role_id ?? ('' as `${bigint}`))) {
			throw new Error(i18next.t('command.common.errors.no_mod_role'));
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
		if (reason && reason.length >= 1900) {
			throw new Error(i18next.t('command.mod.common.errors.max_length_reason', { lng: locale }));
		}

		switch (sub) {
			case 'mute': {
				return mute(message, maybeMember as Ok<`${bigint}`>, duration as string, locale, reason, refId);
			}

			case 'embed': {
				return embed(message, maybeMember as Ok<`${bigint}`>, duration as string, locale, reason, refId);
			}

			case 'react': {
				return react(message, maybeMember as Ok<`${bigint}`>, duration as string, locale, reason, refId);
			}

			case 'emoji': {
				return emoji(message, maybeMember as Ok<`${bigint}`>, duration as string, locale, reason, refId);
			}

			case 'tag': {
				return tag(message, maybeMember as Ok<`${bigint}`>, duration as string, locale, reason, refId);
			}

			case 'unrole': {
				return unrole(message, caseId!, locale);
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

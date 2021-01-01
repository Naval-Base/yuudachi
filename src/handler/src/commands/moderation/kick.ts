import { APIInteraction, APIMessage } from 'discord-api-types/v8';
import API, { HttpException } from '@yuudachi/api';
import { CaseAction } from '@yuudachi/types';
import i18next from 'i18next';
import { Args, joinTokens } from 'lexure';
import { inject, injectable } from 'tsyringe';
import { Sql } from 'postgres';
import { Tokens } from '@yuudachi/core';

import Command from '../../Command';
import parseMember from '../../parsers/member';
import { CommandModules } from '../../Constants';
import { send } from '../../util';

const { kSQL } = Tokens;

@injectable()
export default class implements Command {
	public readonly category = CommandModules.Moderation;

	public constructor(@inject(kSQL) private readonly sql: Sql<any>, private readonly api: API) {}

	private parse(args: Args) {
		const user = args.option('user');
		const reason = args.option('reason');
		const refId = args.option('reference', 'ref');

		return {
			maybeMember: user ? parseMember(user) : args.singleParse(parseMember),
			reason: reason ?? joinTokens(args.many()),
			refId: refId ?? undefined,
		};
	}

	public async execute(message: APIMessage | APIInteraction, args: Args, locale: string): Promise<void> {
		if (!message.guild_id) {
			throw new Error(i18next.t('command.common.errors.no_guild', { lng: locale }));
		}

		const [data] = await this.sql<{ mod_role_id: string | null }>`
			select mod_role_id
			from moderation.guild_settings
			where guild_id = ${message.guild_id}`;

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (!message.member?.roles.includes(data?.mod_role_id ?? '')) {
			throw new Error(i18next.t('command.common.errors.no_mod_role'));
		}

		const { maybeMember, reason, refId } = this.parse(args);
		if (!maybeMember) {
			throw new Error(i18next.t('command.common.errors.no_user_id', { lng: locale }));
		}
		if (!maybeMember.success) {
			throw new Error(i18next.t('command.common.errors.invalid_user_id', { lng: locale, id: maybeMember.error }));
		}
		if (reason && reason.length >= 1900) {
			throw new Error(i18next.t('command.mod.common.errors.max_length_reason', { lng: locale }));
		}

		const memberMention = `<@${maybeMember.value}>`;

		try {
			await this.api.guilds.createCase(message.guild_id, {
				action: CaseAction.KICK,
				reason: reason || undefined,
				moderatorId: 'author' in message ? message.author.id : message.member.user.id,
				targetId: maybeMember.value,
				contextMessageId: message.id,
				referenceId: refId ? Number(refId) : undefined,
			});

			void send(message, {
				content: i18next.t('command.mod.kick.success', { lng: locale, member: memberMention }),
			});
		} catch (e) {
			if (e instanceof HttpException) {
				switch (e.status) {
					case 403:
						throw new Error(i18next.t('command.mod.kick.errors.missing_permissions', { lng: locale }));
					case 404:
						throw new Error(i18next.t('command.common.errors.target_not_found', { lng: locale }));
				}
			}
			throw new Error(i18next.t('command.mod.kick.errors.failure', { lng: locale, member: memberMention }));
		}
	}
}

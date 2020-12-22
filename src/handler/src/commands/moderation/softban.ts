import { APIInteraction, APIMessage } from 'discord-api-types';
import API, { HttpException } from '@yuudachi/api';
import { CaseAction } from '@yuudachi/types';
import i18next from 'i18next';
import { Args, joinTokens } from 'lexure';
import { injectable } from 'tsyringe';

import Command from '../../Command';
import parseMember from '../../parsers/member';
import { CommandModules } from '../../Constants';
import { send } from '../../util';

@injectable()
export default class implements Command {
	public readonly category = CommandModules.Moderation;

	public constructor(private readonly api: API) {}

	private parse(args: Args) {
		const user = args.option('user');
		const reason = args.option('reason');
		const days = args.option('days', 'd');

		return {
			maybeMember: user ? parseMember(user) : args.singleParse(parseMember),
			reason: reason ?? joinTokens(args.many()),
			days,
		};
	}

	public async execute(message: APIMessage | APIInteraction, args: Args, locale: string): Promise<void> {
		if (!message.guild_id) {
			throw new Error(i18next.t('command.common.errors.no_guild', { lng: locale }));
		}

		const { maybeMember, reason, days } = this.parse(args);
		if (!maybeMember) {
			throw new Error(i18next.t('command.common.errors.no_user_id', { lng: locale }));
		}
		if (!maybeMember.success) {
			throw new Error(i18next.t('command.common.errors.invalid_user_id', { lng: locale, id: maybeMember.error }));
		}

		const memberMention = `<@${maybeMember.value}>`;

		try {
			await this.api.guilds.createCase(message.guild_id, {
				action: CaseAction.SOFTBAN,
				reason,
				moderatorId: 'author' in message ? message.author.id : message.member.user.id,
				targetId: maybeMember.value,
				contextMessageId: message.id,
				deleteMessageDays: days ? Number(days) : 7,
			});

			void send(message, {
				content: i18next.t('command.mod.softban.success', { lng: locale, member: memberMention }),
			});
		} catch (e) {
			if (e instanceof HttpException) {
				switch (e.status) {
					case 403:
						throw new Error(i18next.t('command.mod.softban.errors.missing_permissions', { lng: locale }));
					case 404:
						throw new Error(i18next.t('command.common.errors.target_not_found', { lng: locale }));
				}
			}
			throw new Error(i18next.t('command.mod.softban.errors.failure', { lng: locale, member: memberMention }));
		}
	}
}

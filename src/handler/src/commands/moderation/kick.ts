import { APIMessage, Routes } from 'discord-api-types';
import API, { HttpException } from '@yuudachi/api';
import Rest from '@yuudachi/rest';
import { CaseAction } from '@yuudachi/types';
import i18next from 'i18next';
import { Args, joinTokens } from 'lexure';
import { injectable } from 'tsyringe';

import Command from '../../Command';
import parseMember from '../../parsers/member';
import { CommandModules } from '../../Constants';

@injectable()
export default class implements Command {
	public readonly category = CommandModules.Moderation;

	public constructor(private readonly rest: Rest, private readonly api: API) {}

	public async execute(message: APIMessage, args: Args, locale: string): Promise<void> {
		if (!message.guild_id) {
			throw new Error(i18next.t('command.common.errors.no_guild', { lng: locale }));
		}

		const maybeMember = args.singleParse(parseMember);
		if (!maybeMember) {
			throw new Error(i18next.t('command.common.errors.no_user_id', { lng: locale }));
		}
		if (!maybeMember.success) {
			throw new Error(i18next.t('command.common.errors.invalid_user_id', { lng: locale, id: maybeMember.error }));
		}

		const reason = joinTokens(args.many());
		if (!reason.length) {
			throw new Error(i18next.t('command.mod.common.errors.no_reason', { lng: locale }));
		}

		const memberMention = `<@${maybeMember.value}>`;

		try {
			await this.api.guilds.createCase(message.guild_id, {
				action: CaseAction.KICK,
				reason,
				moderatorId: message.author.id,
				targetId: maybeMember.value,
				contextMessageId: message.id,
			});

			void this.rest.post(Routes.channelMessages(message.channel_id), {
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

import { Message } from '@spectacles/types';
import API, { HttpException } from '@yuudachi/api';
import Rest from '@yuudachi/rest';
import { CaseAction } from '@yuudachi/types';
import i18next from 'i18next';
import { Args, joinTokens } from 'lexure';
import { injectable } from 'tsyringe';
import Command from '../../Command';
import parseMember from '../../parsers/member';

@injectable()
export default class KickCommand implements Command {
	public constructor(private readonly rest: Rest, private readonly api: API) {}

	public async execute(message: Message, args: Args, locale: string): Promise<void> {
		if (!message.guild_id) throw new Error(i18next.t('command.mod.common.execute.no_guild', { lng: locale }));

		const maybeMember = args.singleParse(parseMember);
		if (!maybeMember) throw new Error(i18next.t('command.mod.common.execute.no_user_id', { lng: locale }));
		if (!maybeMember.success)
			throw new Error(i18next.t('command.mod.common.execute.invalid_user_id', { lng: locale, id: maybeMember.error }));

		const reason = joinTokens(args.many());
		if (!reason.length) throw new Error(i18next.t('command.mod.common.execute.no_reason', { lng: locale }));

		const memberMention = `<@${maybeMember.value}>`;

		try {
			await this.api.guilds.createCase(message.author.id, message.guild_id, {
				action: CaseAction.KICK,
				reason: reason,
				targetId: maybeMember.value,
				contextMessageId: message.id,
			});

			void this.rest.post(`/channels/${message.channel_id}/messages`, {
				content: i18next.t('command.mod.kick.success', { lng: locale, member: memberMention }),
			});
		} catch (e) {
			console.error(e);
			if (e instanceof HttpException) {
				switch (e.status) {
					case 403:
						throw new Error(i18next.t('command.mod.kick.missing_permissions', { lng: locale }));
					case 404:
						throw new Error(i18next.t('command.mod.common.execute.target_not_found', { lng: locale }));
				}
			}
			throw new Error(i18next.t('command.mod.kick.failure', { lng: locale, member: memberMention }));
		}
	}
}

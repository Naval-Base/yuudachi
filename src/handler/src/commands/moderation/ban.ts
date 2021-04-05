import type { APIGuildInteraction } from 'discord-api-types/v8';
import API, { HttpException } from '@yuudachi/api';
import { CaseAction, CommandModules } from '@yuudachi/types';
import type { TransformedInteraction } from '@yuudachi/interactions';
import i18next from 'i18next';
import { injectable } from 'tsyringe';
import ms from '@naval-base/ms';

import Command from '../../Command';
import { checkMod, send } from '../../util';

@injectable()
export default class implements Command {
	public readonly category = CommandModules.Moderation;

	public constructor(private readonly api: API) {}

	private parse(args: TransformedInteraction) {
		return {
			member: args.ban.user,
			reason: args.ban.reason,
			days: args.ban.days,
			refId: args.ban.reference,
			duration: args.ban.duration,
		};
	}

	public async execute(message: APIGuildInteraction, args: TransformedInteraction, locale: string): Promise<void> {
		await checkMod(message, locale);

		const { member, reason, days, refId, duration } = this.parse(args);

		let parsedDuration;
		if (duration) {
			parsedDuration = ms(duration);
			if (parsedDuration < 300000 || isNaN(parsedDuration)) {
				throw new Error(i18next.t('command.common.errors.duration_format', { lng: locale }));
			}
		}
		if (reason && reason.length >= 1900) {
			throw new Error(i18next.t('command.mod.common.errors.max_length_reason', { lng: locale }));
		}

		const memberMention = `<@${member.user.id}>`;

		try {
			await this.api.guilds.createCase(message.guild_id, {
				action: CaseAction.BAN,
				reason: reason ?? undefined,
				moderatorId: message.member.user.id,
				targetId: member.user.id,
				contextMessageId: message.id,
				referenceId: refId ? Number(refId) : undefined,
				deleteMessageDays: days ? Math.min(Math.max(Number(days), 0), 7) : 0,
				actionExpiration: parsedDuration ? new Date(Date.now() + parsedDuration) : undefined,
			});

			void send(message, {
				content: i18next.t('command.mod.ban.success', { member: memberMention, lng: locale }),
			});
		} catch (e) {
			if (e instanceof HttpException) {
				switch (e.status) {
					case 403:
						throw new Error(i18next.t('command.mod.ban.errors.missing_permissions', { lng: locale }));
					case 404:
						throw new Error(i18next.t('command.common.errors.target_not_found', { lng: locale }));
				}
			}
			throw new Error(i18next.t('command.mod.ban.errors.failure', { member: memberMention, lng: locale }));
		}
	}
}

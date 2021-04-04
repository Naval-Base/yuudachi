import type { APIGuildInteraction } from 'discord-api-types/v8';
import API from '@yuudachi/api';
import i18next from 'i18next';
import { injectable } from 'tsyringe';
import ms from '@naval-base/ms';
import { CommandModules, TransformedInteraction } from '@yuudachi/types';

import Command from '../../Command';
import { checkMod, send } from '../../util';

@injectable()
export default class implements Command {
	public readonly category = CommandModules.Moderation;

	public constructor(private readonly api: API) {}

	private parse(args: TransformedInteraction) {
		return {
			caseId: args.duration.case,
			duration: args.duration.duration,
			hide: args.duration.hide,
		};
	}

	public async execute(message: APIGuildInteraction, args: TransformedInteraction, locale: string): Promise<void> {
		await checkMod(message, locale);

		const { caseId, duration, hide } = this.parse(args);
		if (!caseId) {
			throw new Error(i18next.t('command.mod.common.errors.no_case_id', { lng: locale }));
		}
		if (!duration) {
			throw new Error(i18next.t('command.mod.common.errors.no_duration', { lng: locale }));
		}

		const parsedDuration = ms(duration);
		if (parsedDuration < 300000 || isNaN(parsedDuration)) {
			throw new Error(i18next.t('command.common.errors.duration_format', { lng: locale }));
		}

		try {
			await this.api.guilds.updateCase(message.guild_id, {
				caseId,
				actionExpiration: new Date(Date.now() + parsedDuration),
			});

			void send(message, {
				content: i18next.t('command.mod.duration.success', { case: caseId, lng: locale }),
				flags: hide ? 64 : undefined,
			});
		} catch (e) {
			throw new Error(i18next.t('command.mod.duration.errors.failure', { case: caseId, lng: locale }));
		}
	}
}

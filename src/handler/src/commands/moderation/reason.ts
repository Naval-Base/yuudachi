import type { APIGuildInteraction } from 'discord-api-types/v8';
import API from '@yuudachi/api';
import i18next from 'i18next';
import { injectable } from 'tsyringe';
import { CommandModules, TransformedInteraction } from '@yuudachi/types';

import Command from '../../Command';
import { checkMod, send } from '../../util';

@injectable()
export default class implements Command {
	public readonly category = CommandModules.Moderation;

	public constructor(private readonly api: API) {}

	private parse(args: TransformedInteraction) {
		return {
			caseId: args.reason.case,
			reason: args.reason.reason,
			hide: args.reason.hide,
		};
	}

	public async execute(message: APIGuildInteraction, args: TransformedInteraction, locale: string): Promise<void> {
		await checkMod(message, locale);

		const { caseId, reason, hide } = this.parse(args);
		if (reason.length >= 1900) {
			throw new Error(i18next.t('command.mod.common.errors.max_length_reason', { lng: locale }));
		}

		try {
			await this.api.guilds.updateCase(message.guild_id, {
				caseId,
				reason,
			});

			void send(message, {
				content: i18next.t('command.mod.reason.success', { case: caseId, lng: locale }),
				flags: hide ? 64 : undefined,
			});
		} catch (e) {
			throw new Error(i18next.t('command.mod.reason.errors.failure', { case: caseId, lng: locale }));
		}
	}
}

import type { APIGuildInteraction, APIMessage } from 'discord-api-types/v8';
import API from '@yuudachi/api';
import i18next from 'i18next';
import { Args, joinTokens } from 'lexure';
import { injectable } from 'tsyringe';
import { CommandModules } from '@yuudachi/types';

import Command from '../../Command';
import { checkMod, send } from '../../util';

@injectable()
export default class implements Command {
	public readonly category = CommandModules.Moderation;

	public constructor(private readonly api: API) {}

	private parse(args: Args) {
		const caseId = args.option('case');
		const reason = args.option('reason');

		return {
			caseId: caseId ?? args.single(),
			reason: reason ?? joinTokens(args.many()),
			hide: args.flag('hide'),
		};
	}

	public async execute(message: APIMessage | APIGuildInteraction, args: Args, locale: string): Promise<void> {
		if (!message.guild_id) {
			throw new Error(i18next.t('command.common.errors.no_guild', { lng: locale }));
		}
		await checkMod(message, locale);

		const { caseId, reason, hide } = this.parse(args);
		if (!caseId) {
			throw new Error(i18next.t('command.mod.common.errors.no_case_id', { lng: locale }));
		}
		if (!reason) {
			throw new Error(i18next.t('command.mod.reason.errors.no_reason', { lng: locale }));
		}
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

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
	public readonly aliases = ['ref'];
	public readonly category = CommandModules.Moderation;

	public constructor(private readonly api: API) {}

	private parse(args: Args) {
		const caseId = args.option('case');
		const refId = args.option('reference');

		return {
			caseId: caseId ?? args.single(),
			refId: refId ?? joinTokens(args.many()),
			hide: args.flag('hide'),
		};
	}

	public async execute(message: APIMessage | APIGuildInteraction, args: Args, locale: string): Promise<void> {
		if (!message.guild_id) {
			throw new Error(i18next.t('command.common.errors.no_guild', { lng: locale }));
		}
		await checkMod(message, locale);

		const { caseId, refId, hide } = this.parse(args);
		if (!caseId) {
			throw new Error(i18next.t('command.mod.common.errors.no_case_id', { lng: locale }));
		}
		if (!refId) {
			throw new Error(i18next.t('command.mod.reference.errors.no_ref_id', { lng: locale }));
		}

		try {
			await this.api.guilds.updateCase(message.guild_id, {
				caseId,
				referenceId: refId,
			});

			void send(message, {
				content: i18next.t('command.mod.reference.success', { case: caseId, ref: refId, lng: locale }),
				flags: hide ? 64 : undefined,
			});
		} catch (e) {
			throw new Error(i18next.t('command.mod.reference.errors.failure', { case: caseId, ref: refId, lng: locale }));
		}
	}
}

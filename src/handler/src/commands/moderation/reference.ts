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
			caseId: args.reference.case,
			refId: args.reference.reference,
			hide: args.reference.hide,
		};
	}

	public async execute(message: APIGuildInteraction, args: TransformedInteraction, locale: string): Promise<void> {
		await checkMod(message, locale);

		const { caseId, refId, hide } = this.parse(args);

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

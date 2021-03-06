import { APIInteraction, APIMessage } from 'discord-api-types/v8';
import API from '@yuudachi/api';
import i18next from 'i18next';
import { Args, joinTokens } from 'lexure';
import { inject, injectable } from 'tsyringe';
import { Sql } from 'postgres';
import { Tokens } from '@yuudachi/core';
import { CommandModules } from '@yuudachi/types';

import Command from '../../Command';
import { send } from '../../util';

const { kSQL } = Tokens;

@injectable()
export default class implements Command {
	public readonly aliases = ['ref'];
	public readonly category = CommandModules.Moderation;

	public constructor(@inject(kSQL) private readonly sql: Sql<any>, private readonly api: API) {}

	private parse(args: Args) {
		const caseId = args.option('case');
		const refId = args.option('reference');

		return {
			caseId: caseId ?? args.single(),
			refId: refId ?? joinTokens(args.many()),
			hide: args.flag('hide'),
		};
	}

	public async execute(message: APIMessage | APIInteraction, args: Args, locale: string): Promise<void> {
		if (!message.guild_id) {
			throw new Error(i18next.t('command.common.errors.no_guild', { lng: locale }));
		}

		const [data] = await this.sql<{ mod_role_id: `${bigint}` | null }[]>`
			select mod_role_id
			from guild_settings
			where guild_id = ${message.guild_id}`;

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (!message.member?.roles.includes(data?.mod_role_id ?? ('' as `${bigint}`))) {
			throw new Error(i18next.t('command.common.errors.no_mod_role'));
		}

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
				content: i18next.t('command.mod.reference.success', { lng: locale, case: caseId, ref: refId }),
				flags: hide ? 64 : undefined,
			});
		} catch (e) {
			throw new Error(i18next.t('command.mod.reference.errors.failure', { lng: locale, case: caseId, ref: refId }));
		}
	}
}

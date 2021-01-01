import { APIInteraction, APIMessage } from 'discord-api-types/v8';
import API from '@yuudachi/api';
import i18next from 'i18next';
import { Args, joinTokens } from 'lexure';
import { inject, injectable } from 'tsyringe';
import ms from '@naval-base/ms';
import { Sql } from 'postgres';
import { Tokens } from '@yuudachi/core';

import Command from '../../Command';
import { CommandModules } from '../../Constants';
import { send } from '../../util';

const { kSQL } = Tokens;

@injectable()
export default class implements Command {
	public readonly category = CommandModules.Moderation;

	public constructor(@inject(kSQL) private readonly sql: Sql<any>, private readonly api: API) {}

	private parse(args: Args) {
		const caseId = args.option('case');
		const duration = args.option('duration');

		return {
			caseId: caseId ?? args.single(),
			duration: duration ?? joinTokens(args.many()),
			hide: args.flag('hide'),
		};
	}

	public async execute(message: APIMessage | APIInteraction, args: Args, locale: string): Promise<void> {
		if (!message.guild_id) {
			throw new Error(i18next.t('command.common.errors.no_guild', { lng: locale }));
		}

		const [data] = await this.sql<{ mod_role_id: string | null }>`
			select mod_role_id
			from moderation.guild_settings
			where guild_id = ${message.guild_id}`;

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (!message.member?.roles.includes(data?.mod_role_id ?? '')) {
			throw new Error(i18next.t('command.common.errors.no_mod_role'));
		}

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

			void send(
				message,
				{
					content: i18next.t('command.mod.duration.success', { lng: locale, case: caseId }),
					flags: hide ? 64 : undefined,
				},
				hide ? 3 : 4,
			);
		} catch (e) {
			throw new Error(i18next.t('command.mod.duration.errors.failure', { lng: locale, case: caseId }));
		}
	}
}

import { APIInteraction, APIMessage } from 'discord-api-types/v8';
import i18next from 'i18next';
import API, { HttpException } from '@yuudachi/api';
import { container } from 'tsyringe';
import { Sql } from 'postgres';
import { Tokens } from '@yuudachi/core';

import { send } from '../../../../util';

const { kSQL } = Tokens;

export async function unrole(message: APIMessage | APIInteraction, caseId: string, locale: string) {
	const sql = container.resolve<Sql<any>>(kSQL);
	const api = container.resolve(API);

	const [action] = await sql<{ action_processed: boolean }>`
		select action_processed
		from moderation.cases
		where guild_id = ${message.guild_id!}
			and case_id = ${caseId}`;

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (action?.action_processed) {
		throw new Error(i18next.t('command.mod.restrict.unrole.errors.already_processed', { lng: locale }));
	}

	try {
		await api.guilds.deleteCase(message.guild_id!, Number(caseId));

		void send(message, {
			content: i18next.t('command.mod.restrict.unrole.success', { lng: locale, case: caseId }),
		});
	} catch (e) {
		if (e instanceof HttpException) {
			switch (e.status) {
				case 403:
					throw new Error(i18next.t('command.mod.restrict.unrole.errors.missing_permissions', { lng: locale }));
				case 404:
					throw new Error(i18next.t('command.common.errors.target_not_found', { lng: locale }));
			}
		}
		throw new Error(i18next.t('command.mod.restrict.unrole.errors.failure', { lng: locale, case: caseId }));
	}
}

import type { APIGuildInteraction } from 'discord-api-types/v8';
import i18next from 'i18next';
import API, { HttpException } from '@yuudachi/api';
import { container } from 'tsyringe';
import type { Sql } from 'postgres';
import { Tokens } from '@yuudachi/core';
import type { TransformedInteraction } from '@yuudachi/interactions';

import { send } from '../../../../util';

const { kSQL } = Tokens;

export async function unrole(
	message: APIGuildInteraction,
	args: TransformedInteraction['restrict']['unrole'],
	locale: string,
) {
	const sql = container.resolve<Sql<any>>(kSQL);
	const api = container.resolve(API);

	const [action] = await sql<[{ action_processed: boolean }?]>`
		select action_processed
		from cases
		where guild_id = ${message.guild_id}
			and case_id = ${args.case}`;

	if (action?.action_processed) {
		throw new Error(i18next.t('command.mod.restrict.unrole.errors.already_processed', { lng: locale }));
	}

	try {
		await api.guilds.deleteCase(message.guild_id, Number(args.case));

		void send(message, {
			content: i18next.t('command.mod.restrict.unrole.success', { case: args.case, lng: locale }),
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
		throw new Error(i18next.t('command.mod.restrict.unrole.errors.failure', { case: args.case, lng: locale }));
	}
}

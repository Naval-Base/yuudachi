import { APIInteraction, APIMessage } from 'discord-api-types/v8';
import i18next from 'i18next';
import API, { HttpException } from '@yuudachi/api';
import { container } from 'tsyringe';

import { send } from '../../../../util';

export async function unrole(message: APIMessage | APIInteraction, caseId: string, locale: string) {
	const api = container.resolve(API);

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

import type { APIGuildInteraction, Snowflake } from 'discord-api-types/v8';
import i18next from 'i18next';
import API, { HttpException } from '@yuudachi/api';
import { container } from 'tsyringe';

import { send } from '../../../../util';

export async function lift(message: APIGuildInteraction, channel: Snowflake, locale: string) {
	const api = container.resolve(API);

	const channelMention = `<#${channel}>`;

	try {
		await api.guilds.deleteLockdown(message.guild_id, {
			channelId: channel,
		});

		void send(message, {
			content: i18next.t('command.mod.lockdown.lift.success', { channel: channelMention, lng: locale }),
		});
	} catch (e) {
		if (e instanceof HttpException) {
			switch (e.status) {
				case 403:
					throw new Error(i18next.t('command.mod.lockdown.lift.errors.missing_permissions', { lng: locale }));
				case 404:
					throw new Error(i18next.t('command.common.errors.target_not_found', { lng: locale }));
			}
		}
		throw new Error(i18next.t('command.mod.lockdown.lift.errors.failure', { channel: channelMention, lng: locale }));
	}
}

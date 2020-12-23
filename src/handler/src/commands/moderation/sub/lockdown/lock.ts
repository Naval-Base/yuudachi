import { APIInteraction, APIMessage, Routes } from 'discord-api-types';
import { Ok } from 'lexure';
import i18next from 'i18next';
import ms from '@naval-base/ms';
import API, { HttpException } from '@yuudachi/api';
import { container } from 'tsyringe';
import Rest from '@yuudachi/rest';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

import { send } from '../../../../util';

export async function lock(
	message: APIMessage | APIInteraction,
	maybeChannel: Ok<string>,
	duration: string,
	reason: string,
	locale: string,
) {
	const api = container.resolve(API);
	const rest = container.resolve(Rest);

	const parsedDuration = ms(duration);
	if (parsedDuration < 300000 || isNaN(parsedDuration)) {
		throw new Error(i18next.t('command.common.errors.duration_format', { lng: locale }));
	}

	const channelMention = `<#${maybeChannel.value}>`;

	try {
		const duration = new Date(Date.now() + parsedDuration);
		await api.guilds.createLockdown(message.guild_id!, {
			channelId: maybeChannel.value,
			expiration: duration,
			moderatorId: 'author' in message ? message.author.id : message.member.user.id,
			reason: reason || undefined,
		});

		await rest.post(Routes.channelMessages(maybeChannel.value), {
			content: i18next.t('command.mod.lockdown.lock.message', {
				duration: dayjs(duration.toISOString()).fromNow(true),
			}),
		});

		void send(message, {
			content: i18next.t('command.mod.lockdown.lock.success', { lng: locale, channel: channelMention }),
		});
	} catch (e) {
		if (e instanceof HttpException) {
			switch (e.status) {
				case 403:
					throw new Error(i18next.t('command.mod.lockdown.lock.errors.missing_permissions', { lng: locale }));
				case 404:
					throw new Error(i18next.t('command.common.errors.target_not_found', { lng: locale }));
			}
		}
		throw new Error(i18next.t('command.mod.lockdown.lock.errors.failure', { lng: locale, channel: channelMention }));
	}
}

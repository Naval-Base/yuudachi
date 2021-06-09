import { APIGuildInteraction, Routes, Snowflake } from 'discord-api-types/v8';
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
	message: APIGuildInteraction,
	channel: Snowflake,
	duration: string,
	reason: string | undefined,
	locale: string,
) {
	const api = container.resolve(API);
	const rest = container.resolve(Rest);

	const parsedDuration = ms(duration);
	if (parsedDuration < 300000 || isNaN(parsedDuration)) {
		throw new Error(i18next.t('command.common.errors.duration_format', { lng: locale }));
	}

	const channelMention = `<#${channel}>`;

	try {
		const duration = new Date(Date.now() + parsedDuration);
		await api.guilds.createLockdown(message.guild_id, {
			channelId: channel,
			expiration: duration,
			moderatorId: message.member.user.id,
			reason: reason ?? undefined,
		});

		await rest.post(Routes.channelMessages(channel), {
			content: i18next.t('command.mod.lockdown.lock.message', {
				duration: dayjs(duration.toISOString()).fromNow(true),
				lng: locale,
			}),
		});

		void send(message, {
			content: i18next.t('command.mod.lockdown.lock.success', { channel: channelMention, lng: locale }),
		});
	} catch (e) {
		if (e instanceof HttpException) {
			switch (e.status) {
				case 403:
					throw new Error(i18next.t('command.mod.lockdown.lock.errors.missing_permissions', { lng: locale }));
				case 404:
					throw new Error(i18next.t('common.errors.target_not_found', { lng: locale }));
			}
		}
		throw new Error(i18next.t('command.mod.lockdown.lock.errors.failure', { channel: channelMention, lng: locale }));
	}
}

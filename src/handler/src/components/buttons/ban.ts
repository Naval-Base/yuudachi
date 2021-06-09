import API, { HttpException } from '@yuudachi/api';
import { inject, injectable } from 'tsyringe';
import { Tokens } from '@yuudachi/core';
import Redis from 'ioredis';
import i18next from 'i18next';

import Component from '../../Component';
import { checkMod, send } from '../../util';

const { kRedis } = Tokens;

@injectable()
export default class implements Component {
	public constructor(private readonly api: API, @inject(kRedis) private readonly redis: Redis.Redis) {}

	public async execute(message: any, args: unknown, locale: string): Promise<void> {
		await checkMod(message, locale, true);

		const [command, id, action] = message.data.custom_id.split('|');
		const parsedAction = Number(action);

		if (!parsedAction) {
			void this.redis.del(`${command}|${id}`);
			// @ts-expect-error
			void send(message, { content: i18next.t('component.mod.ban.cancel', { lng: locale }), components: [] }, {}, 7);
			return;
		}

		let memberMention;
		try {
			const result = await this.redis.get(`${command}|${id}`);
			void this.redis.del(`${command}|${id}`);
			const payload = JSON.parse(result!);

			memberMention = `<@${payload.targetId}>`;

			await this.api.guilds.createCase(message.guild_id, payload);

			void send(
				message,
				// @ts-expect-error
				{ content: i18next.t('component.mod.ban.success', { member: memberMention, lng: locale }), components: [] },
				{},
				7,
			);
		} catch (e) {
			if (e instanceof HttpException) {
				switch (e.status) {
					case 403:
						throw new Error(i18next.t('component.mod.ban.errors.missing_permissions', { lng: locale }));
					case 404:
						throw new Error(i18next.t('common.errors.target_not_found', { lng: locale }));
				}
			}
			throw new Error(i18next.t('component.mod.ban.errors.failure', { member: memberMention, lng: locale }));
		}
	}
}

import type { APIGuildInteraction } from 'discord-api-types/v8';
import { CaseAction, CommandModules } from '@yuudachi/types';
import type { ArgumentsOf, BanCommand } from '@yuudachi/interactions';
import i18next from 'i18next';
import { inject, injectable } from 'tsyringe';
import ms from '@naval-base/ms';
import { Tokens } from '@yuudachi/core';
import Redis from 'ioredis';
import { nanoid } from 'nanoid';

import Command from '../../Command';
import { checkMod, send } from '../../util';

const { kRedis } = Tokens;

@injectable()
export default class implements Command {
	public readonly category = CommandModules.Moderation;

	public constructor(@inject(kRedis) private readonly redis: Redis.Redis) {}

	private parse(args: ArgumentsOf<typeof BanCommand>) {
		return {
			member: args.user,
			reason: args.reason,
			days: args.days,
			refId: args.reference,
			duration: args.duration,
		};
	}

	public async execute(
		message: APIGuildInteraction,
		args: ArgumentsOf<typeof BanCommand>,
		locale: string,
	): Promise<void> {
		await checkMod(message, locale);

		const { member, reason, days, refId, duration } = this.parse(args);

		let parsedDuration;
		if (duration) {
			parsedDuration = ms(duration);
			if (parsedDuration < 300000 || isNaN(parsedDuration)) {
				throw new Error(i18next.t('command.common.errors.duration_format', { lng: locale }));
			}
		}
		if (reason && reason.length >= 1900) {
			throw new Error(i18next.t('command.mod.common.errors.max_length_reason', { lng: locale }));
		}

		const memberMention = `<@${member.user.id}>`;

		try {
			const payload = {
				action: CaseAction.BAN,
				reason: reason ?? undefined,
				moderatorId: message.member.user.id,
				targetId: member.user.id,
				contextMessageId: message.id,
				referenceId: refId ? Number(refId) : undefined,
				deleteMessageDays: days ? Math.min(Math.max(Number(days), 0), 7) : 0,
				actionExpiration: parsedDuration ? new Date(Date.now() + parsedDuration) : undefined,
			};
			const key = `${message.data?.name}|${nanoid()}`;
			await this.redis.set(key, JSON.stringify(payload));

			void send(message, {
				content: i18next.t('command.mod.ban.pending', { member: memberMention, lng: locale }),
				// @ts-expect-error
				components: [
					{
						type: 1,
						components: [
							{
								type: 2,
								label: 'Cancel',
								style: 2,
								custom_id: `${key}|0`,
							},
							{
								type: 2,
								label: 'Execute',
								style: 4,
								custom_id: `${key}|1`,
							},
						],
					},
				],
			});
		} catch (e) {
			throw new Error(i18next.t('command.mod.ban.errors.failure', { member: memberMention, lng: locale }));
		}
	}
}

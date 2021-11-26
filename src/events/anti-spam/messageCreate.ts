import { Client, Constants, Message } from 'discord.js';
import { inject, injectable } from 'tsyringe';
import { on } from 'node:events';
import type { Redis } from 'ioredis';
import i18next from 'i18next';

import type { Event } from '../../Event';
import { logger } from '../../logger';
import { Case, CaseAction, createCase } from '../../functions/cases/createCase';
import { upsertCaseLog } from '../../functions/logs/upsertCaseLog';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting';
import { MENTION_THRESHOLD, SCAM_THRESHOLD, SPAM_THRESHOLD } from '../../Constants';
import { checkLogChannel } from '../../functions/settings/checkLogChannel';
import { totalMentions } from '../../functions/anti-spam/totalMentions';
import { totalContent } from '../../functions/anti-spam/totalContents';
import { kRedis } from '../../tokens';
import { totalScams } from '../../functions/anti-scam/totalScam';

@injectable()
export default class implements Event {
	public name = 'Spam check';

	public event = Constants.Events.MESSAGE_CREATE;

	public constructor(public readonly client: Client<true>, @inject(kRedis) public readonly redis: Redis) {}

	public async execute(): Promise<void> {
		for await (const [message] of on(this.client, this.event) as AsyncIterableIterator<[Message]>) {
			try {
				if (message.author.bot || !message.guild || !message.guildId || !message.content.length) continue;

				const totalMentionCount = await totalMentions(message);
				const totalContentCount = await totalContent(message.content, message.guildId, message.author.id);
				const totalScamCount = await totalScams(message.content, message.guildId, message.author.id);

				const mentionExceeded = totalMentionCount >= MENTION_THRESHOLD;
				const contentExceeded = totalContentCount >= SPAM_THRESHOLD;
				const scamExceeded = totalScamCount >= SCAM_THRESHOLD;

				if (scamExceeded || mentionExceeded || contentExceeded) {
					if (!message.member?.bannable) continue;

					const logChannel = await checkLogChannel(
						message.guild,
						await getGuildSetting(message.guildId, SettingsKeys.ModLogChannelId),
					);
					if (!logChannel) {
						continue;
					}

					const locale = await getGuildSetting(message.guildId, SettingsKeys.Locale);

					await this.redis.setex(`guild:${message.guildId}:user:${message.author.id}:ban`, 15, '');
					let case_: Case | null = null;

					if (scamExceeded || mentionExceeded) {
						logger.info(
							{
								event: { name: this.name, event: this.event },
								guildId: message.guild.id,
								userId: message.client.user!.id,
								memberId: message.author.id,
								mentionExceeded,
								scamExceeded,
							},
							`Member ${message.author.id} banned (spam/scam)`,
						);

						case_ = await createCase(message.guild, {
							targetId: message.author.id,
							guildId: message.guildId,
							action: CaseAction.Ban,
							targetTag: message.author.tag,
							reason: i18next.t(scamExceeded ? 'log.mod_log.scam.reason' : 'log.mod_log.spam.reason_mentions', {
								lng: locale,
							}),
							deleteMessageDays: 1,
						});
					} else if (contentExceeded) {
						logger.info(
							{
								event: { name: this.name, event: this.event },
								guildId: message.guildId,
								userId: message.client.user!.id,
								memberId: message.author.id,
							},
							`Member ${message.author.id} softbanned (spam)`,
						);

						await this.redis.setex(`guild:${message.guildId}:user:${message.author.id}:unban`, 15, '');
						case_ = await createCase(message.guild, {
							targetId: message.author.id,
							guildId: message.guild.id,
							action: CaseAction.Softban,
							targetTag: message.author.tag,
							reason: i18next.t('log.mod_log.spam.reason', { lng: locale }),
							deleteMessageDays: 1,
						});
					}

					await upsertCaseLog(message.guildId, this.client.user, case_!);
				}
			} catch (e) {
				const error = e as Error;
				logger.error(error, error.message);
			}

			continue;
		}
	}
}

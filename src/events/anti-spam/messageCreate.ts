import { Client, Constants, Message } from 'discord.js';
import { inject, injectable } from 'tsyringe';
import { on } from 'node:events';
import type { Redis } from 'ioredis';
import i18next from 'i18next';

import { logger } from '../logger';
import { logger } from '../../logger';
import { Case, CaseAction, createCase } from '../../functions/cases/createCase';
import { upsertCaseLog } from '../../functions/logs/upsertCaseLog';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting';
import { MENTION_THRESHOLD, SPAM_SCAM_THRESHOLD, SPAM_THRESHOLD } from '../../Constants';
import { checkLogChannel } from '../../functions/settings/checkLogChannel';
import { totalMentions } from '../../functions/anti-spam/totalMentions';
import { totalContent } from '../../functions/anti-spam/totalContents';
import { checkScam } from '../../functions/anti-scam/checkScam';

@injectable()
export default class implements Event {
	public name = 'Spam check';

	public event = Constants.Events.MESSAGE_CREATE;

	public constructor(public readonly client: Client<true>, @inject(kRedis) public readonly redis: Redis) {}

	public async execute(): Promise<void> {
		for await (const [message] of on(this.client, this.event) as AsyncIterableIterator<[Message]>) {
			try {
				if (message.author.bot || !message.guild || !message.content.length) continue;

				const totalMentionCount = await totalMentions(message);
				const totalContentCount = await totalContent(message.content, message.guild.id, message.author.id);

				const mentionExceeded = totalMentionCount >= MENTION_THRESHOLD;
				const contentExceeded = totalContentCount >= SPAM_THRESHOLD;
				const scamContentExceeded = totalContentCount >= SPAM_SCAM_THRESHOLD;

				const scamDomains = await checkScam(message.content);

				if ((scamContentExceeded && scamDomains.length) || mentionExceeded || contentExceeded) {
					if (!message.member?.bannable) continue;

					const logChannel = await checkLogChannel(
						message.guild,
						await getGuildSetting(message.guild.id, SettingsKeys.ModLogChannelId),
					);
					if (!logChannel) {
						continue;
					}

					const locale = await getGuildSetting(message.guild.id, SettingsKeys.Locale);

					await this.redis.setex(`guild:${message.guild.id}:user:${message.author.id}:ban`, 15, '');
					let case_: Case | null = null;

					if ((scamContentExceeded && scamDomains.length) || mentionExceeded) {
						logger.info(
							{
								event: { name: this.name, event: this.event },
								guildId: message.guild.id,
								userId: message.client.user!.id,
								memberId: message.author.id,
								mentionExceeded,
								scamDomains,
							},
							`Member ${message.author.id} banned (spam/scam)`,
						);

						case_ = await createCase(message.guild, {
							targetId: message.author.id,
							guildId: message.guild.id,
							action: CaseAction.Ban,
							targetTag: message.author.tag,
							reason: i18next.t(scamDomains.length ? 'log.mod_log.scam.reason' : 'log.mod_log.spam.reason_mentions', {
								lng: locale,
							}),
							deleteMessageDays: 1,
						});
					} else if (contentExceeded) {
						logger.info(
							{
								event: { name: this.name, event: this.event },
								guildId: message.guild.id,
								userId: message.client.user!.id,
								memberId: message.author.id,
							},
							`Member ${message.author.id} softbanned (spam)`,
						);

						await this.redis.setex(`guild:${message.guild.id}:user:${message.author.id}:unban`, 15, '');
						case_ = await createCase(message.guild, {
							targetId: message.author.id,
							guildId: message.guild.id,
							action: CaseAction.Softban,
							targetTag: message.author.tag,
							reason: i18next.t('log.mod_log.spam.reason', { lng: locale }),
							deleteMessageDays: 1,
						});
					}

					await upsertCaseLog(message.guild.id, this.client.user, case_!);
				}
			} catch (e) {
				logger.error(e, e.message);
			}

			continue;
		}
	}
}

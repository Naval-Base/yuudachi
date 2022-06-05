import { on } from 'node:events';
import { Client, Events, type Message } from 'discord.js';
import i18next from 'i18next';
import type { Redis } from 'ioredis';
import { inject, injectable } from 'tsyringe';
import { MENTION_THRESHOLD, SPAM_THRESHOLD } from '../../Constants.js';
import type { Event } from '../../Event.js';
import { createContentHash, totalContent } from '../../functions/anti-spam/totalContents.js';
import { totalMentions } from '../../functions/anti-spam/totalMentions.js';
import { type Case, CaseAction, createCase } from '../../functions/cases/createCase.js';
import { upsertCaseLog } from '../../functions/logs/upsertCaseLog.js';
import { checkLogChannel } from '../../functions/settings/checkLogChannel.js';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting.js';
import { logger } from '../../logger.js';
import { kRedis } from '../../tokens.js';

@injectable()
export default class implements Event {
	public name = 'Spam check';

	public event = Events.MessageCreate;

	public constructor(public readonly client: Client<true>, @inject(kRedis) public readonly redis: Redis) {}

	public async execute(): Promise<void> {
		for await (const [message] of on(this.client, this.event) as AsyncIterableIterator<[Message]>) {
			try {
				if (message.author.bot || !message.guild || !message.guildId || !message.content.length) continue;

				const totalMentionCount = await totalMentions(message);
				const totalContentCount = await totalContent(message.content, message.guildId, message.author.id);

				const mentionExceeded = totalMentionCount >= MENTION_THRESHOLD;
				const contentExceeded = totalContentCount >= SPAM_THRESHOLD;

				if (mentionExceeded || contentExceeded) {
					if (!message.member?.bannable) continue;

					const logChannel = await checkLogChannel(
						message.guild,
						(await getGuildSetting(message.guildId, SettingsKeys.ModLogChannelId)) as string,
					);
					if (!logChannel) {
						continue;
					}

					const locale = (await getGuildSetting(message.guildId, SettingsKeys.Locale)) as string;

					await this.redis.setex(`guild:${message.guildId}:user:${message.author.id}:ban`, 15, '');
					let case_: Case | null = null;

					if (mentionExceeded) {
						logger.info(
							{
								event: { name: this.name, event: this.event },
								guildId: message.guild.id,
								userId: message.client.user!.id,
								memberId: message.author.id,
								mentionExceeded,
							},
							`Member ${message.author.id} banned (mention spam)`,
						);

						case_ = await createCase(message.guild, {
							targetId: message.author.id,
							guildId: message.guildId,
							action: CaseAction.Ban,
							targetTag: message.author.tag,
							reason: i18next.t('log.mod_log.spam.reason_mentions', {
								lng: locale,
							}),
							deleteMessageDays: 1,
						});
						const mentionCountKey = `guild:${message.guild.id}:user:${message.author.id}:mentions`;
						await this.redis.del(mentionCountKey);
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

						const contentHash = createContentHash(message.content);
						const channelSpamKey = `guild:${message.guild.id}:user:${message.author.id}:contenthash:${contentHash}`;
						await this.redis.del(channelSpamKey);
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

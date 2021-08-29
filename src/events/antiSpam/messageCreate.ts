import { Client, Constants, Message } from 'discord.js';
import { inject, injectable } from 'tsyringe';
import type { Event } from '../../Event';
import { kRedis } from '../../tokens';
import { on } from 'node:events';
import { createHash } from 'node:crypto';
import type { Redis } from 'ioredis';
import { logger } from '../../logger';
import { CaseAction, createCase } from '../../functions/cases/createCase';
import { upsertCaseLog } from '../../functions/logs/upsertCaseLog';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting';
import i18next from 'i18next';
import { SPAM_EXPIRE_SECONDS, SPAM_SCAM_THRESHOLD, SPAM_THRESHOLD } from '../../Constants';

@injectable()
export default class implements Event {
	public name = 'Spam check';

	public event = Constants.Events.MESSAGE_CREATE;

	public constructor(public readonly client: Client<true>, @inject(kRedis) public readonly redis: Redis) {}

	public async execute(): Promise<void> {
		for await (const [message] of on(this.client, this.event) as AsyncIterableIterator<[Message]>) {
			try {
				if (!message.guild || !message.content.length) continue;

				// TODO: fuzzy hashing to combat spam bots that slightly vary content
				const contentHash = createHash('md5').update(message.content.toLowerCase()).digest('hex');
				const channelSpamKey = `guild:${message.guild.id}:user:${message.author.id}:contenthash:${contentHash}`;
				await this.redis.incr(channelSpamKey);
				await this.redis.expire(channelSpamKey, SPAM_EXPIRE_SECONDS);

				const scamDomains = await this.redis.smembers('scamdomains');

				const spamAmount = parseInt((await this.redis.get(channelSpamKey)) ?? '0', 10);
				const hitScams = scamDomains.filter((domain) => message.content.toLowerCase().includes(domain));

				if (!message.member?.bannable) continue;

				const locale = await getGuildSetting(message.guild.id, SettingsKeys.Locale);
				if (hitScams.length && spamAmount >= SPAM_SCAM_THRESHOLD) {
					logger.info(
						{
							event: { name: this.name, event: this.event },
							guildId: message.guild.id,
							userId: message.client.user!.id,
							memberId: message.author.id,
							domains: hitScams,
						},
						`Member ${message.author.id} banned (scam)`,
					);

					await this.redis.setex(`guild:${message.guild.id}:user:${message.author.id}:ban`, 15, '');

					const case_ = await createCase(message.guild, {
						targetId: message.author.id,
						guildId: message.guild.id,
						action: CaseAction.Ban,
						targetTag: message.author.tag,
						reason: i18next.t('log.mod_log.scam.reason', { lng: locale }),
						deleteMessageDays: 1,
					});

					await upsertCaseLog(message.guild.id, this.client.user, case_);
				} else if (spamAmount >= SPAM_THRESHOLD) {
					logger.info(
						{
							event: { name: this.name, event: this.event },
							guildId: message.guild.id,
							userId: message.client.user!.id,
							memberId: message.author.id,
							spamAmount,
						},
						`Member ${message.author.id} softbanned (spam)`,
					);

					await this.redis.setex(`guild:${message.guild.id}:user:${message.author.id}:ban`, 15, '');
					await this.redis.setex(`guild:${message.guild.id}:user:${message.author.id}:unban`, 15, '');

					const case_ = await createCase(message.guild, {
						targetId: message.author.id,
						guildId: message.guild.id,
						action: CaseAction.Softban,
						targetTag: message.author.tag,
						reason: i18next.t('log.mod_log.spam.reason', { lng: locale }),
						deleteMessageDays: 1,
					});

					await upsertCaseLog(message.guild.id, this.client.user, case_);
				}
			} catch (e) {
				logger.error(e, e.message);
			}

			continue;
		}
	}
}

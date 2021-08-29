import { Client, Constants, Message } from 'discord.js';
import { inject, injectable } from 'tsyringe';
import type { Event } from '../../Event';
import { kRedis } from '../../tokens';
import { on } from 'node:events';
import { createHash } from 'node:crypto';
import type { Redis } from 'ioredis';
import { transformHashset } from '../../util/redisData';
import { logger } from '../../logger';
import { CaseAction, createCase } from '../../functions/cases/createCase';
import { upsertCaseLog } from '../../functions/logs/upsertCaseLog';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting';
import i18next from 'i18next';
import { SPAM_EXPIRE_SECONDS, SPAM_THRESHOLD } from '../../Constants';

@injectable()
export default class implements Event {
	public name = 'Spam check';

	public event = Constants.Events.MESSAGE_CREATE;

	public constructor(public readonly client: Client<true>, @inject(kRedis) public readonly redis: Redis) {}

	public async execute(): Promise<void> {
		for await (const [message] of on(this.client, this.event) as AsyncIterableIterator<[Message]>) {
			try {
				if (!message.guild || !message.content.length) continue;

				const contentHash = createHash('md5').update(message.content).digest('hex');
				const channelSpamKey = `guild:${message.guild.id}:user:${message.author.id}:contenthash:${contentHash}:channels`;
				await this.redis.hincrby(channelSpamKey, message.channelId, 1);
				await this.redis.expire(channelSpamKey, SPAM_EXPIRE_SECONDS);

				const scamDomains = await this.redis.smembers('scamdomains');

				const channelMessageCounts = transformHashset(await this.redis.hgetall(channelSpamKey), (s: string) =>
					parseInt(s, 10),
				);
				const total = Object.values(channelMessageCounts).reduce((acc, curr) => curr + acc, 0);

				if (total < SPAM_THRESHOLD) continue;

				const hitScams = scamDomains.filter((domain) => message.content.toLowerCase().includes(domain));
				if (!hitScams.length || !message.member?.bannable) continue;

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

				const locale = await getGuildSetting(message.guild.id, SettingsKeys.Locale);
				const scamCase = await createCase(message.guild, {
					targetId: message.author.id,
					guildId: message.guild.id,
					action: CaseAction.Ban,
					targetTag: message.author.tag,
					reason: i18next.t('log.mod_log.scam.reason', { lng: locale }),
					deleteMessageDays: 1,
				});

				await upsertCaseLog(message.guild.id, this.client.user, scamCase);
			} catch (e) {
				logger.error(e, e.message);
			}

			continue;
		}
	}
}

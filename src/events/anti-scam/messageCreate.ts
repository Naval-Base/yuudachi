import { on } from 'node:events';
import { Client, Events, type Message } from 'discord.js';
import i18next from 'i18next';
import type { Redis } from 'ioredis';
import { inject, injectable } from 'tsyringe';
import { SCAM_THRESHOLD } from '../../Constants.js';
import type { Event } from '../../Event.js';
import { totalScams } from '../../functions/anti-scam/totalScam.js';
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

				const totalScamCount = await totalScams(message.content, message.guildId, message.author.id);
				const scamExceeded = totalScamCount >= SCAM_THRESHOLD;

				if (scamExceeded) {
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

					logger.info(
						{
							event: { name: this.name, event: this.event },
							guildId: message.guild.id,
							userId: message.client.user!.id,
							memberId: message.author.id,
							scamExceeded,
						},
						`Member ${message.author.id} banned (scam)`,
					);

					case_ = await createCase(message.guild, {
						targetId: message.author.id,
						guildId: message.guildId,
						action: CaseAction.Ban,
						targetTag: message.author.tag,
						reason: i18next.t('log.mod_log.scam.reason', {
							lng: locale,
						}),
						deleteMessageDays: 1,
					});

					const scamKey = `guild:${message.guildId}:user:${message.author.id}:scams`;
					await this.redis.del(scamKey);
					await upsertCaseLog(message.guildId, this.client.user, case_);
				}
			} catch (e) {
				const error = e as Error;
				logger.error(error, error.message);
			}

			continue;
		}
	}
}

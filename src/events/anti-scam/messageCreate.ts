import { on } from 'node:events';
import { Client, Events, type Message } from 'discord.js';
import i18next from 'i18next';
import type { Redis } from 'ioredis';
import { inject, injectable } from 'tsyringe';
import { SCAM_THRESHOLD } from '../../Constants.js';
import type { Event } from '../../Event.js';
import { totalScams } from '../../functions/anti-scam/totalScam.js';
import { considerableText } from '../../functions/anti-spam/considerableText.js';
import { CaseAction } from '../../functions/cases/createCase.js';
import { checkLogChannel } from '../../functions/settings/checkLogChannel.js';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting.js';
import { logger } from '../../logger.js';
import { RawModAction } from '../../structures/ModAction.js';
import { kRedis } from '../../tokens.js';

@injectable()
export default class implements Event {
	public name = 'Spam check';

	public event = Events.MessageCreate;

	public constructor(public readonly client: Client<true>, @inject(kRedis) public readonly redis: Redis) {}

	public async execute(): Promise<void> {
		for await (const [message] of on(this.client, this.event) as AsyncIterableIterator<[Message]>) {
			try {
				const content = considerableText(message);
				if (!content || !message.inGuild()) {
					continue;
				}

				const totalScamCount = await totalScams(content, message.guildId, message.author.id);
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

					await new RawModAction(
						message.guild,
						{
							targetId: message.author.id,
							guildId: message.guildId,
							action: CaseAction.Ban,
							targetTag: message.author.tag,
							reason: i18next.t('log.mod_log.scam.reason', {
								lng: locale,
							}),
							deleteMessageDays: 1,
						},
						this.redis,
					).takeAction();

					const scamKey = `guild:${message.guildId}:user:${message.author.id}:scams`;
					await this.redis.del(scamKey);
				}
			} catch (e) {
				const error = e as Error;
				logger.error(error, error.message);
			}

			continue;
		}
	}
}

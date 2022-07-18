import { on } from 'node:events';
import { Client, Events, type GuildMember } from 'discord.js';
import i18next from 'i18next';
import type { Redis } from 'ioredis';
import { inject, injectable } from 'tsyringe';
import type { Event } from '../../Event.js';
import { checkUsername } from '../../functions/anti-raid/usernameCheck.js';
import { CaseAction, createCase } from '../../functions/cases/createCase.js';
import { upsertCaseLog } from '../../functions/logging/upsertCaseLog.js';
import { checkLogChannel } from '../../functions/settings/checkLogChannel.js';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting.js';
import { logger } from '../../logger.js';
import { kRedis } from '../../tokens.js';

@injectable()
export default class implements Event {
	public name = 'User check';

	public event = Events.GuildMemberAdd;

	public constructor(public readonly client: Client<true>, @inject(kRedis) public readonly redis: Redis) {}

	public async execute(): Promise<void> {
		for await (const [guildMember] of on(this.client, this.event) as AsyncIterableIterator<[GuildMember]>) {
			try {

				const guild = guildMember.guild;
				const badNameHit = await checkUsername(this.redis, guildMember.user.username);

				if (badNameHit) {
					const logChannel = await checkLogChannel(
						guild,
						(await getGuildSetting(guild.id, SettingsKeys.ModLogChannelId)) as string,
					);
					if (!logChannel) {
						continue;
					}

					const locale = (await getGuildSetting(guild.id, SettingsKeys.Locale)) as string;

					await this.redis.setex(`guild:${guild.id}:user:${guildMember.id}:ban`, 15, '');

					logger.info(
						{
							event: { name: this.name, event: this.event },
							guildId: guild.id,
							userId: this.client.user.id,
							memberId: guildMember.id,
							badNameHit,
						},
						`Member ${guildMember.id} banned (Bad Usename)`,
					);

					const case_ = await createCase(guild, {
						targetId: guildMember.id,
						guildId: guild.id,
						action: CaseAction.Ban,
						targetTag: guildMember.user.tag,
						reason: i18next.t('log.mod_log.username.reason', {
							lng: locale,
							username: badNameHit.name,
						}),
						deleteMessageDays: 1,
					});

					await upsertCaseLog(guild.id, this.client.user, case_);
				}
			} catch (e) {
				const error = e as Error;
				logger.error(error, error.message);
			}

			continue;
		}
	}
}

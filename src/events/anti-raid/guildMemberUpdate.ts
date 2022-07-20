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
	public name = 'User update check';

	public event = Events.GuildMemberUpdate;

	public constructor(public readonly client: Client<true>, @inject(kRedis) public readonly redis: Redis) {}

	public async execute(): Promise<void> {
		for await (const [oldMember, newMember] of on(this.client, this.event) as AsyncIterableIterator<
			[GuildMember, GuildMember]
		>) {
			try {
				const [oldUser, newUser] = [oldMember.user, newMember.user];
				const guild = newMember.guild;

				if (oldUser.username === newUser.username) {
					return;
				}

				const badNameHit = await checkUsername(this.redis, newUser.username);

				if (badNameHit) {
					const logChannel = await checkLogChannel(
						guild,
						(await getGuildSetting(guild.id, SettingsKeys.ModLogChannelId)) as string,
					);
					if (!logChannel) {
						continue;
					}

					const locale = (await getGuildSetting(guild.id, SettingsKeys.Locale)) as string;

					await this.redis.setex(`guild:${guild.id}:user:${newMember.id}:kick`, 15, '');

					logger.info(
						{
							event: { name: this.name, event: this.event },
							guildId: guild.id,
							userId: this.client.user.id,
							memberId: newMember.id,
							badNameHit,
						},
						`Member ${newMember.id} kicked (Account possibly compromised)`,
					);

					const case_ = await createCase(guild, {
						targetId: newMember.id,
						guildId: guild.id,
						action: CaseAction.Kick,
						targetTag: newUser.tag,
						reason: i18next.t('log.mod_log.username.reason_update', {
							lng: locale,
							username: badNameHit.name,
						}),
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

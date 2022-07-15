import { on } from 'node:events';
import { Client, Events, type GuildMember } from 'discord.js';
import i18next from 'i18next';
import type { Redis } from 'ioredis';
import { inject, injectable } from 'tsyringe';
import type { Event } from '../../Event.js';
import { checkUsername } from '../../functions/anti-raid/usernameCheck.js';
import { Case, CaseAction, createCase } from '../../functions/cases/createCase.js';
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
				const badNameHit = checkUsername(guildMember.user.username);

				if (badNameHit) {
					const logChannel = await checkLogChannel(
						guildMember.guild,
						(await getGuildSetting(guildMember.guild.id, SettingsKeys.ModLogChannelId)) as string,
					);
					if (!logChannel) {
						continue;
					}

					const locale = (await getGuildSetting(guildMember.guild.id, SettingsKeys.Locale)) as string;

					await this.redis.setex(`guild:${guildMember.guild.id}:user:${guildMember.id}:ban`, 15, '');
					let case_: Case | null = null;

					logger.info(
						{
							event: { name: this.name, event: this.event },
							guildId: guildMember.guild.id,
							userId: guildMember.client.user!.id,
							memberId: guildMember.id,
							badNameHit,
						},
						`Member ${guildMember.id} banned (Bad Usename)`,
					);

					case_ = await createCase(guildMember.guild, {
						targetId: guildMember.id,
						guildId: guildMember.guild.id,
						action: CaseAction.Ban,
						targetTag: guildMember.user.tag,
						reason: i18next.t('log.mod_log.username.reason', {
							lng: locale,
							username: badNameHit.name,
						}),
						deleteMessageDays: 1,
					});

					await upsertCaseLog(guildMember.guild.id, this.client.user, case_);
				}
			} catch (e) {
				const error = e as Error;
				logger.error(error, error.message);
			}

			continue;
		}
	}
}

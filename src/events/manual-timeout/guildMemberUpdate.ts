import { AuditLogEvent } from 'discord-api-types/v9';
import { Client, Constants, GuildMember, User } from 'discord.js';
import type { Redis } from 'ioredis';
import { on } from 'node:events';
import { setTimeout as pSetTimeout } from 'node:timers/promises';
import { inject, injectable } from 'tsyringe';

import type { Event } from '../../Event';
import { createCase, CaseAction } from '../../functions/cases/createCase';
import { generateCasePayload } from '../../functions/logs/generateCasePayload';
import { upsertCaseLog } from '../../functions/logs/upsertCaseLog';
import { checkLogChannel } from '../../functions/settings/checkLogChannel';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting';
import { logger } from '../../logger';
import { kRedis } from '../../tokens';

@injectable()
export default class implements Event {
	public name = 'Manual timeout handling';

	public event = Constants.Events.GUILD_MEMBER_UPDATE;

	public constructor(public readonly client: Client<true>, @inject(kRedis) public readonly redis: Redis) {}

	public async execute(): Promise<void> {
		for await (const [oldMember, newMember] of on(this.client, this.event) as AsyncIterableIterator<
			[GuildMember, GuildMember]
		>) {
			try {
				const logChannel = await checkLogChannel(
					oldMember.guild,
					await getGuildSetting(oldMember.guild.id, SettingsKeys.ModLogChannelId),
				);

				if (!logChannel) {
					continue;
				}

				if (
					(oldMember.communicationDisabledUntilTimestamp &&
						oldMember.communicationDisabledUntilTimestamp > Date.now()) ||
					!newMember.communicationDisabledUntilTimestamp
				) {
					continue;
				}

				const deleted = await this.redis.del(`guild:${oldMember.guild.id}:user:${oldMember.id}:timeout`);
				if (deleted) {
					logger.info(
						{
							event: { name: this.name, event: this.event },
							guildId: oldMember.guild.id,
							memberId: oldMember.id,
							manual: false,
						},
						`Member ${oldMember.id} timed out`,
					);

					continue;
				}

				await pSetTimeout(5000);
				const auditLogs = await oldMember.guild.fetchAuditLogs({ limit: 10, type: AuditLogEvent.MemberUpdate });
				const logs = auditLogs.entries.find((log) => {
					return (
						(log.target as User).id === oldMember.user.id &&
						// @ts-ignore
						Boolean(log.changes?.some((c) => c.key === 'communication_disabled_until'))
					);
				});

				if (!logs?.changes) {
					continue;
				}

				// @ts-ignore
				const timeoutChange = logs.changes.find((c) => c.key === 'communication_disabled_until' && c.new && !c.old);

				if (!timeoutChange) {
					continue;
				}

				logger.info(
					{
						event: { name: this.name, event: this.event },
						guildId: oldMember.guild.id,
						userId: logs.executor?.id,
						memberId: oldMember.id,
						manual: true,
						logs,
					},
					`Fetched logs for timeout ${oldMember.id}`,
				);

				const case_ = await createCase(
					oldMember.guild,
					generateCasePayload({
						guildId: oldMember.guild.id,
						user: logs.executor,
						args: { user: { user: oldMember.user }, reason: logs.reason },
						action: CaseAction.Timeout,
						duration: newMember.communicationDisabledUntilTimestamp - Date.now(),
					}),
					true,
				);
				await upsertCaseLog(oldMember.guild.id, logs.executor, case_);
			} catch (e) {
				const error = e as Error;
				logger.error(error, error.message);
			}

			continue;
		}
	}
}

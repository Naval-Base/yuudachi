import { Client, type Snowflake } from 'discord.js';
import i18next from 'i18next';
import type { default as Redis } from 'ioredis';
import { container } from 'tsyringe';
import { createContentHash, totalContents } from './totalContents.js';
import { totalMentions } from './totalMentions.js';
import { MENTION_THRESHOLD, SPAM_THRESHOLD } from '../../Constants.js';
import { logger } from '../../logger.js';
import { kRedis } from '../../tokens.js';
import { type Case, CaseAction, createCase } from '../cases/createCase.js';
import { upsertCaseLog } from '../logging/upsertCaseLog.js';
import { checkLogChannel } from '../settings/checkLogChannel.js';
import { getGuildSetting, SettingsKeys } from '../settings/getGuildSetting.js';

export async function handleAntiSpam(
	guildId: Snowflake,
	userId: Snowflake,
	content: string,
	event: { name: string; event: string },
): Promise<void> {
	const client = container.resolve<Client<true>>(Client);
	const redis = container.resolve<Redis>(kRedis);

	const guild = client.guilds.resolve(guildId);

	if (!guild) {
		return;
	}

	const member = await guild.members.fetch(userId);

	const ignoreRoles = await getGuildSetting<string[]>(guildId, SettingsKeys.AutomodIgnoreRoles);

	if (ignoreRoles.some((id) => member.roles.cache.has(id))) {
		return;
	}

	const totalMentionCount = await totalMentions(guildId, userId, content);
	const totalContentCount = await totalContents(guildId, userId, content);

	const mentionExceeded = totalMentionCount >= MENTION_THRESHOLD;
	const contentExceeded = totalContentCount >= SPAM_THRESHOLD;

	if (mentionExceeded || contentExceeded) {
		if (!member.bannable) {
			return;
		}

		const modLogChannel = checkLogChannel(member.guild, await getGuildSetting(guildId, SettingsKeys.ModLogChannelId));

		if (!modLogChannel) {
			return;
		}

		const locale = await getGuildSetting(guildId, SettingsKeys.Locale);

		await redis.setex(`guild:${guildId}:user:${userId}:ban`, 15, '');

		let case_: Case | null = null;
		if (mentionExceeded) {
			logger.info(
				{
					event: { event },
					guildId: guildId,
					userId: client.user.id,
					memberId: userId,
					mentionExceeded,
				},
				`Member ${userId} banned (mention spam)`,
			);

			case_ = await createCase(guild, {
				targetId: userId,
				guildId: guildId,
				action: CaseAction.Ban,
				targetTag: member.user.tag,
				reason: i18next.t('log.mod_log.spam.reason_mentions', {
					lng: locale,
				}),
				deleteMessageDays: 1,
			});

			await redis.del(`guild:${guildId}:user:${userId}:mentions`);
		} else if (contentExceeded) {
			logger.info(
				{
					event: { event },
					guildId: guildId,
					userId: client.user.id,
					memberId: userId,
				},
				`Member ${userId} softbanned (spam)`,
			);

			await redis.setex(`guild:${guildId}:user:${userId}:unban`, 15, '');

			case_ = await createCase(member.guild, {
				targetId: userId,
				guildId: guildId,
				action: CaseAction.Softban,
				targetTag: member.user.tag,
				reason: i18next.t('log.mod_log.spam.reason', { lng: locale }),
				deleteMessageDays: 1,
			});

			const contentHash = createContentHash(content);

			await redis.del(`guild:${guildId}:user:${userId}:contenthash:${contentHash}`);
		}

		await upsertCaseLog(guild, client.user, case_!);
	}
}

import type { GuildMember } from 'discord.js';
import i18next from 'i18next';
import type { Redis } from 'ioredis';
import { container } from 'tsyringe';
import { createContentHash, totalContents } from './totalContents.js';
import { totalMentions } from './totalMentions.js';
import { MENTION_THRESHOLD, SPAM_THRESHOLD } from '../../Constants.js';
import { logger } from '../../logger.js';
import { kRedis } from '../../tokens.js';
import { Case, CaseAction, createCase } from '../cases/createCase.js';
import { upsertCaseLog } from '../logging/upsertCaseLog.js';
import { checkLogChannel } from '../settings/checkLogChannel.js';
import { getGuildSetting, SettingsKeys } from '../settings/getGuildSetting.js';

export async function handleAntiSpam(
	member: GuildMember,
	content: string,
	event: { name: string; event: string },
): Promise<void> {
	const redis = container.resolve<Redis>(kRedis);

	const ignoreRoles = await getGuildSetting<string[]>(member.guild.id, SettingsKeys.AutomodIgnoreRoles);

	if (ignoreRoles.some((id) => member.roles.cache.has(id))) {
		return;
	}

	const totalMentionCount = await totalMentions(member, content);
	const totalContentCount = await totalContents(content, member.guild.id, member.id);

	const mentionExceeded = totalMentionCount >= MENTION_THRESHOLD;
	const contentExceeded = totalContentCount >= SPAM_THRESHOLD;

	if (mentionExceeded || contentExceeded) {
		if (!member.bannable) {
			return;
		}

		const modLogChannel = await checkLogChannel(
			member.guild,
			await getGuildSetting(member.guild.id, SettingsKeys.ModLogChannelId),
		);

		if (!modLogChannel) {
			return;
		}

		const locale = await getGuildSetting(member.guild.id, SettingsKeys.Locale);

		await redis.setex(`guild:${member.guild.id}:user:${member.id}:ban`, 15, '');
		let case_: Case | null = null;

		if (mentionExceeded) {
			logger.info(
				{
					event: { event },
					guildId: member.guild.id,
					userId: member.client.user!.id,
					memberId: member.id,
					mentionExceeded,
				},
				`Member ${member.id} banned (mention spam)`,
			);

			case_ = await createCase(member.guild, {
				targetId: member.id,
				guildId: member.guild.id,
				action: CaseAction.Ban,
				targetTag: member.user.tag,
				reason: i18next.t('log.mod_log.spam.reason_mentions', {
					lng: locale,
				}),
				deleteMessageDays: 1,
			});
			const mentionCountKey = `guild:${member.guild.id}:user:${member.id}:mentions`;
			await redis.del(mentionCountKey);
		} else if (contentExceeded) {
			logger.info(
				{
					event: { event },
					guildId: member.guild.id,
					userId: member.client.user!.id,
					memberId: member.id,
				},
				`Member ${member.id} softbanned (spam)`,
			);

			await redis.setex(`guild:${member.guild.id}:user:${member.id}:unban`, 15, '');
			case_ = await createCase(member.guild, {
				targetId: member.id,
				guildId: member.guild.id,
				action: CaseAction.Softban,
				targetTag: member.user.tag,
				reason: i18next.t('log.mod_log.spam.reason', { lng: locale }),
				deleteMessageDays: 1,
			});

			const contentHash = createContentHash(content);
			const channelSpamKey = `guild:${member.guild.id}:user:${member.id}:contenthash:${contentHash}`;
			await redis.del(channelSpamKey);
		}

		await upsertCaseLog(member.guild, member.client.user, case_!);
	}
}

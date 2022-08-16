import { type Message, type Snowflake, codeBlock, hyperlink, messageLink, userMention, type User } from 'discord.js';
import i18next from 'i18next';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';
import { kSQL } from '../../tokens.js';
import type { Report } from '../reports/createReport.js';
import { getGuildSetting, SettingsKeys } from '../settings/getGuildSetting.js';

export async function generateReportLog(
	report: Report,
	locale: string,
	message?: Message,
	moderator?: User,
): Promise<string> {
	const sql = container.resolve<Sql<any>>(kSQL);

	const parts = [];

	parts.push(
		i18next.t('log.report_log.target', {
			target: `${userMention(report.targetId)} - \`${report.targetTag}\` (${report.targetId})`,
			lng: locale,
		}),
		i18next.t('log.report_log.reason', {
			reason: codeBlock(report.reason),
			lng: locale,
		}),
	);

	if (message) {
		parts.push(
			i18next.t('log.report_log.message', {
				message_link: hyperlink(i18next.t('log.report_log.message_sub', { lng: locale }), message.url),
				// TextChannels have an custom `.toString()` method that returns the channel's mention.
				// eslint-disable-next-line @typescript-eslint/no-base-to-string
				channel: message.channel.toString(),
				lng: locale,
			}),
		);
	}

	if (report.referenceId) {
		const [reference] = await sql<[{ log_message_id: Snowflake | null }?]>`
		select log_message_id
		from cases
		where guild_id = ${report.guildId}
			and case_id = ${report.referenceId}`;

		const modLogChannelId = await getGuildSetting(report.guildId, SettingsKeys.ModLogChannelId);

		if (modLogChannelId && Reflect.has(reference ?? {}, 'log_message_id')) {
			parts.push(
				i18next.t('log.report_log.case_reference', {
					ref: hyperlink(
						`#${report.referenceId}`,
						messageLink(modLogChannelId, reference!.log_message_id!, report.guildId),
					),
					lng: locale,
				}),
			);
		}
	}

	parts.push(
		i18next.t('log.report_log.status', {
			status: report.status,
			lng: locale,
		}),
	);

	if (moderator) {
		parts.push(
			'',
			i18next.t('log.report_log.moderator', {
				mod: `\`${moderator.tag}\` (${moderator.id})`,
				lng: locale,
			}),
		);
	}

	return parts.join('\n');
}

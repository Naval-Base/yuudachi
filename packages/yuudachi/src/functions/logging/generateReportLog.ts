import {
	type Message,
	type Snowflake,
	codeBlock,
	hyperlink,
	messageLink,
	userMention,
	channelMention,
	time,
	TimestampStyles,
} from 'discord.js';
import i18next from 'i18next';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';
import { REPORT_REASON_MAX_LENGTH } from '../../Constants.js';
import { kSQL } from '../../tokens.js';
import { ellipsis } from '../../util/embed.js';
import type { Report } from '../reports/createReport.js';
import { getGuildSetting, SettingsKeys } from '../settings/getGuildSetting.js';

export async function generateReportLog(report: Report, locale: string, message?: Message | null): Promise<string> {
	const sql = container.resolve<Sql<any>>(kSQL);

	const parts = [
		i18next.t('log.report_log.target', {
			target: `${userMention(report.targetId)} - \`${report.targetTag}\` (${report.targetId})`,
			lng: locale,
		}),
		i18next.t('log.report_log.reason', {
			reason: codeBlock(ellipsis(report.reason, REPORT_REASON_MAX_LENGTH * 2)),
			lng: locale,
		}),
	];

	if (message || report.messageId) {
		parts.push(
			i18next.t('log.report_log.message', {
				message_link: message
					? hyperlink(i18next.t('log.report_log.message_sub', { lng: locale }), message.url)
					: i18next.t('log.report_log.message_fallback', { lng: locale }),
				// TextChannels have an custom `.toString()` method that returns the channel's mention.
				// eslint-disable-next-line @typescript-eslint/no-base-to-string
				channel: channelMention(report.channelId!),
				lng: locale,
			}),
		);
	}

	if (report.refId) {
		const [reference] = await sql<[{ log_message_id: Snowflake | null }?]>`
			select log_message_id
			from cases
			where guild_id = ${report.guildId}
				and case_id = ${report.refId}`;

		const modLogChannelId = await getGuildSetting(report.guildId, SettingsKeys.ModLogChannelId);

		if (modLogChannelId && Reflect.has(reference ?? {}, 'log_message_id')) {
			parts.push(
				i18next.t('log.report_log.case_reference', {
					ref: hyperlink(`#${report.refId}`, messageLink(modLogChannelId, reference!.log_message_id!, report.guildId)),
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

	if (report.modId && report.modTag) {
		parts.push(
			'',
			i18next.t('log.report_log.moderator', {
				mod: `\`${report.modTag}\` (${report.modId})`,
				lng: locale,
			}),
			i18next.t('log.report_log.updated_at', {
				updated_at: time(new Date(report.updatedAt ?? report.createdAt), TimestampStyles.ShortDateTime),
				lng: locale,
			}),
		);
	}

	return parts.join('\n');
}

import dayjs from 'dayjs';
import {
	type APIEmbed,
	type Message,
	type User,
	time,
	TimestampStyles,
	hyperlink,
	codeBlock,
	messageLink,
	type Snowflake,
} from 'discord.js';
import i18next from 'i18next';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';
import { Color } from '../../Constants.js';
import { kSQL } from '../../tokens.js';
import { type Report, ReportStatus } from '../reports/createReport.js';
import { getGuildSetting, SettingsKeys } from '../settings/getGuildSetting.js';

function statusToColor(status: ReportStatus): Color {
	switch (status) {
		case ReportStatus.Pending:
			return Color.DiscordPrimary;
		case ReportStatus.Approved:
			return Color.DiscordSuccess;
		case ReportStatus.Rejected:
			return Color.DiscordWarning;
		case ReportStatus.False:
			return Color.DiscordDanger;
	}
}

export async function generateReportEmbed(
	user: User,
	report: Report,
	locale: string,
	message?: Message,
): Promise<APIEmbed> {
	const sql = container.resolve<Sql<any>>(kSQL);

	const descParts = [];

	const embed: APIEmbed = {
		author: {
			name: i18next.t('log.report_log.author', {
				author: `\`${user.tag}\` (${user.id})`,
				lng: locale,
			}),
			icon_url: user.avatarURL()!,
		},
		color: statusToColor(report.status),
		timestamp: new Date().toISOString(),
		footer: {
			text: i18next.t('log.report_log.footer', {
				report_id: report.reportId,
				type: report.type,
				lng: locale,
			}),
		},
	};

	descParts.push(
		i18next.t('log.report_log.target', {
			target: `\`${report.targetTag}\` (${report.targetId})`,
			lng: locale,
		}),
		i18next.t('log.report_log.reason', {
			reason: codeBlock(report.reason),
			lng: locale,
		}),
	);

	if (message) {
		descParts.push(
			i18next.t('log.report_log.message', {
				message_link: hyperlink(i18next.t('log.report_log.message_sub', { lng: locale }), message.url),
				// TextChannels have an custom `.toString()` method that returns the channel's mention.
				// eslint-disable-next-line @typescript-eslint/no-base-to-string
				channel: message.channel.toString(),
				lng: locale,
			}),
		);
	}

	if (report.attachmentUrl) {
		embed.image = {
			url: report.attachmentUrl,
		};
	}

	if (report.referenceId) {
		const [reference] = await sql<[{ log_message_id: Snowflake | null }?]>`
		select log_message_id
		from cases
		where guild_id = ${report.guildId}
			and case_id = ${report.referenceId}`;

		const modLogChannelId = await getGuildSetting(report.guildId, SettingsKeys.ModLogChannelId);

		if (modLogChannelId && Reflect.has(reference ?? {}, 'log_message_id')) {
			descParts.push(
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

	descParts.push(
		'',
		i18next.t('log.report_log.status', {
			status: report.status,
			lng: locale,
		}),
		i18next.t('log.report_log.created_at', {
			created_at: time(dayjs().unix(), TimestampStyles.ShortDateTime),
			lng: locale,
		}),
	);

	embed.description = descParts.join('\n');

	return embed;
}

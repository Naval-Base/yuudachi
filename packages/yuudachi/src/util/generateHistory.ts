import { logger, kSQL, addFields, truncate, EMBED_DESCRIPTION_LIMIT, container } from "@yuudachi/framework";
import { oneLine } from "common-tags";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import {
	type CommandInteraction,
	type ButtonInteraction,
	type GuildMember,
	type SelectMenuInteraction,
	type User,
	type APIEmbed,
	hyperlink,
	inlineCode,
	time,
	TimestampStyles,
	messageLink,
	channelLink,
} from "discord.js";
import i18next from "i18next";
import type { Sql } from "postgres";
import { Color, HISTORY_DESCRIPTION_MAX_LENGTH, ThreatLevelColor } from "../Constants.js";
import { CaseAction } from "../functions/cases/createCase.js";
import type { RawCase } from "../functions/cases/transformCase.js";
import { ReportStatus } from "../functions/reports/createReport.js";
import type { RawReport } from "../functions/reports/transformReport.js";
import { getGuildSetting, SettingsKeys } from "../functions/settings/getGuildSetting.js";
import { caseActionLabel, reportStatusLabel } from "./actionKeys.js";

dayjs.extend(relativeTime);

type CaseFooter = {
	[key: string]: number | undefined;
	ban?: number | undefined;
	kick?: number | undefined;
	mute?: number | undefined;
	restriction?: number | undefined;
	timeout?: number | undefined;
	warn?: number | undefined;
};

const colors = [
	ThreatLevelColor.Level0,
	ThreatLevelColor.Level1,
	ThreatLevelColor.Level2,
	ThreatLevelColor.Level3,
	ThreatLevelColor.Level4,
	ThreatLevelColor.Level5,
	ThreatLevelColor.Level6,
	ThreatLevelColor.Level7,
];

type HistoryRecord = {
	created: string;
	description?: string;
	identifierLabel: string;
	identifierURL?: string;
	label: string;
};

function generateHistoryEmbed(
	author: User,
	title: string,
	color: number,
	records: HistoryRecord[],
	footerText: string,
	locale: string,
): APIEmbed {
	const descriptionParts = [];
	const truncatePhrase = i18next.t("common.and_more", { lng: locale });

	if (!records.length) {
		descriptionParts.push(i18next.t("log.history.common.errors.no_history", { lng: locale }));
	}

	for (const record of records) {
		const dateFormatted = time(dayjs(record.created).unix(), TimestampStyles.ShortDate);
		const recordString = `${dateFormatted} ${inlineCode(record.label)} ${
			record.identifierURL ? hyperlink(record.identifierLabel, record.identifierURL) : record.identifierLabel
		} ${
			record.description
				? truncate(oneLine(record.description.replaceAll("*", "")), HISTORY_DESCRIPTION_MAX_LENGTH, "")
				: ""
		}`;

		if (
			descriptionParts.join("\n").length + recordString.length + 1 <
			EMBED_DESCRIPTION_LIMIT - truncatePhrase.length
		) {
			descriptionParts.push(recordString);
		} else {
			descriptionParts.push(truncatePhrase);
		}
	}

	return {
		author: {
			name: `${author.tag} (${author.id})`,
			icon_url: author.displayAvatarURL(),
		},
		title,
		color,
		description: descriptionParts.join("\n"),
		footer: {
			text: footerText,
		},
	};
}

function actionSummary(
	restrictions: number,
	warns: number,
	kicks: number,
	softbans: number,
	bans: number,
	unbans: number,
	timeouts: number,
	locale: string,
) {
	return [
		i18next.t("log.history.cases.summary.restriction", {
			count: restrictions,
			lng: locale,
		}),
		i18next.t("log.history.cases.summary.warning", {
			count: warns,
			lng: locale,
		}),
		i18next.t("log.history.cases.summary.kick", {
			count: kicks,
			lng: locale,
		}),
		i18next.t("log.history.cases.summary.softban", {
			count: softbans,
			lng: locale,
		}),
		i18next.t("log.history.cases.summary.ban", {
			count: bans,
			lng: locale,
		}),
		i18next.t("log.history.cases.summary.unban", {
			count: unbans,
			lng: locale,
		}),
		i18next.t("log.history.cases.summary.timeout", {
			count: timeouts,
			lng: locale,
		}),
	].join(", ");
}

export async function generateCaseHistory(
	interaction: ButtonInteraction<"cached"> | CommandInteraction<"cached"> | SelectMenuInteraction<"cached">,
	target: { member?: GuildMember | undefined; user: User },
	locale: string,
) {
	const sql = container.resolve<Sql<any>>(kSQL);
	const moduleLogChannelId = await getGuildSetting(interaction.guildId, SettingsKeys.ModLogChannelId);

	const cases = await sql<[RawCase]>`
		select *
		from cases
		where guild_id = ${interaction.guildId}
			and target_id = ${target.user.id}
			and action not in (1, 8)
		order by created_at desc
	`;

	const caseCounter = cases.reduce((count: CaseFooter, case_) => {
		const action = case_.action!;
		count[action] = (count[action] ?? 0) + 1;
		return count;
	}, {});

	const values: [number, number, number, number, number, number, number] = [
		caseCounter[CaseAction.Role] ?? 0,
		caseCounter[CaseAction.Warn] ?? 0,
		caseCounter[CaseAction.Kick] ?? 0,
		caseCounter[CaseAction.Softban] ?? 0,
		caseCounter[CaseAction.Ban] ?? 0,
		caseCounter[CaseAction.Unban] ?? 0,
		caseCounter[CaseAction.Timeout] ?? 0,
	];
	const colorIndex = Math.min(
		values.reduce((a, b) => a + b),
		colors.length - 1,
	);

	const records: HistoryRecord[] = cases.map((case_) => {
		return {
			created: case_.created_at,
			identifierLabel: `#${case_.case_id}`,
			identifierURL: case_.log_message_id
				? messageLink(moduleLogChannelId, case_.log_message_id, case_.guild_id)
				: undefined,
			label: caseActionLabel(case_.action, locale).toUpperCase(),
			description: case_.reason ?? undefined,
		};
	});

	return generateHistoryEmbed(
		target.user,
		i18next.t("log.history.cases.title", { lng: locale }),
		colors[colorIndex] ?? Color.DiscordEmbedBackground,
		records,
		actionSummary(...values, locale),
		locale,
	);
}

function reportSummary(reported: number, authored: number, spam: number, locale: string) {
	return [
		i18next.t("log.history.reports.summary.target", {
			count: reported,
			lng: locale,
		}),
		i18next.t("log.history.reports.summary.author", {
			count: authored,
			lng: locale,
		}),
		i18next.t("log.history.reports.summary.spam", {
			count: spam,
			lng: locale,
		}),
	].join(", ");
}

export async function generateReportHistory(
	interaction: ButtonInteraction<"cached"> | CommandInteraction<"cached"> | SelectMenuInteraction<"cached">,
	target: { member?: GuildMember | undefined; user: User },
	locale: string,
) {
	const sql = container.resolve<Sql<any>>(kSQL);

	const rawReports = await sql<[RawReport]>`
		select *
		from reports
		where guild_id = ${interaction.guildId}
			and (
					author_id = ${target.user.id}
					or target_id = ${target.user.id}
			)
				and status != ${ReportStatus.Rejected}
		order by created_at desc
	`;

	const reports = rawReports.filter(
		(report) => !(report.status === ReportStatus.Spam && report.target_id === target.user.id),
	);

	const colorIndex = Math.min(
		reports.filter((report) => report.status === ReportStatus.Approved || report.status === ReportStatus.Spam).length,
		colors.length - 1,
	);

	let authorCounter = 0;
	let targetCounter = 0;
	let authoredSpamCounter = 0;

	const records: HistoryRecord[] = reports.map((report) => {
		if (report.author_id === target.user.id) {
			authorCounter++;

			if (report.status === ReportStatus.Spam) {
				authoredSpamCounter++;
			}
		} else if (report.target_id === target.user.id) {
			targetCounter++;
		}

		const userRoleString =
			report.author_id === target.user.id
				? i18next.t("log.history.reports.user_role.author", { lng: locale })
				: i18next.t("log.history.reports.user_role.target", { lng: locale });
		return {
			created: report.created_at,
			identifierLabel: `#${report.report_id} (${userRoleString})`,
			identifierURL: report.log_post_id ? channelLink(report.log_post_id, report.guild_id) : undefined,
			label: reportStatusLabel(report.status, locale).toUpperCase(),
			description: report.reason ?? undefined,
		};
	});

	return generateHistoryEmbed(
		target.user,
		i18next.t("log.history.reports.title", { lng: locale }),
		colors[colorIndex] ?? Color.DiscordEmbedBackground,
		records,
		reportSummary(targetCounter, authorCounter, authoredSpamCounter, locale),
		locale,
	);
}

export function generateUserInfo(target: { member?: GuildMember | undefined; user: User }, locale: string) {
	const sinceCreationFormatted = time(dayjs(target.user.createdTimestamp).unix(), TimestampStyles.RelativeTime);
	const creationFormatted = time(dayjs(target.user.createdTimestamp).unix(), TimestampStyles.ShortDateTime);

	let embed = addFields(
		{
			author: {
				name: `${target.user.tag} (${target.user.id})`,
				icon_url: target.user.displayAvatarURL(),
			},
			color: Color.DiscordEmbedBackground,
		},
		{
			name: i18next.t("log.history.common.user_details.title", { lng: locale }),
			value: i18next.t("log.history.common.user_details.description", {
				user_mention: target.user.toString(),
				user_tag: target.user.tag,
				user_id: target.user.id,
				created_at: creationFormatted,
				created_at_since: sinceCreationFormatted,
				created_at_timestamp: target.user.createdTimestamp,
				lng: locale,
			}),
		},
	);

	if (target.member?.joinedTimestamp) {
		const sinceJoinFormatted = time(dayjs(target.member.joinedTimestamp).unix(), TimestampStyles.RelativeTime);
		const joinFormatted = time(dayjs(target.member.joinedTimestamp).unix(), TimestampStyles.ShortDateTime);

		const memberDescriptionParts = [];
		const nonDefaultRoles = target.member.roles.cache.filter((role) => role.id !== role.guild.roles.everyone.id);

		if (target.member.nickname) {
			memberDescriptionParts.push(
				i18next.t("log.history.common.member_details.description.nickname", {
					nickname: target.member.nickname,
					lng: locale,
				}),
			);
		}

		if (nonDefaultRoles.size) {
			memberDescriptionParts.push(
				i18next.t("log.history.common.member_details.description.roles", {
					count: nonDefaultRoles.size,
					roles: nonDefaultRoles.map((role) => role.toString()),
					lng: locale,
				}),
			);
		}

		memberDescriptionParts.push(
			i18next.t("log.history.common.member_details.description.joined", {
				joined_at: joinFormatted,
				joined_at_since: sinceJoinFormatted,
				joined_at_timestamp: target.member.joinedTimestamp,
				lng: locale,
			}),
		);

		embed = addFields(embed, {
			name: i18next.t("log.history.common.member_details.title", { lng: locale }),
			value: memberDescriptionParts.join("\n"),
		});
	}

	return embed;
}

export enum HistoryType {
	Case,
	Report,
}

export async function generateHistory(
	interaction: ButtonInteraction<"cached"> | CommandInteraction<"cached"> | SelectMenuInteraction<"cached">,
	target: { member?: GuildMember | undefined; user: User },
	locale: string,
	type = HistoryType.Case,
) {
	let embed = generateUserInfo(target, locale);

	switch (type) {
		case HistoryType.Case: {
			embed = {
				...embed,
				...(await generateCaseHistory(interaction, target, locale)),
			};
			break;
		}

		case HistoryType.Report: {
			embed = {
				...embed,
				...(await generateReportHistory(interaction, target, locale)),
			};
			break;
		}

		default: {
			logger.warn(`Unhandled history type: ${HistoryType[type]} (${type})`);
		}
	}

	if (!embed.color) {
		embed.color = Color.DiscordEmbedBackground;
	}

	return embed;
}

import { logger, kSQL, container } from "@yuudachi/framework";
import { Client, type Snowflake, hyperlink, time, TimestampStyles, messageLink, channelLink } from "discord.js";
import i18next from "i18next";
import type { Sql } from "postgres";
import { caseActionLabel } from "../../util/actionKeys.js";
import { type Case, CaseAction } from "../cases/createCase.js";
import { getGuildSetting, SettingsKeys } from "../settings/getGuildSetting.js";

export async function generateCaseLog(case_: Case, logChannelId: Snowflake, locale: string) {
	const client = container.get<Client<true>>(Client);
	const sql = container.get<Sql<any>>(kSQL);

	let action = caseActionLabel(case_.action, locale, true);

	if ((case_.action === CaseAction.Role || case_.action === CaseAction.Unrole) && case_.roleId) {
		try {
			const guild = client.guilds.cache.get(case_.guildId)!;
			const role = guild.roles.cache.get(case_.roleId);

			if (role) {
				action += ` \`${role.name}\` (${role.id})`;
			} else {
				action += ` \`Unknown\` (${case_.roleId})`;
			}
		} catch (error_) {
			const error = error_ as Error;
			logger.error(error, error.message);
		}
	}

	let msg = i18next.t("log.mod_log.case_log.description", {
		target_tag: case_.targetTag,
		target_id: case_.targetId,
		action,
		lng: locale,
	});

	if (case_.actionExpiration) {
		msg += i18next.t("log.mod_log.case_log.expiration", {
			time: time(new Date(case_.actionExpiration), TimestampStyles.RelativeTime),
			lng: locale,
		});
	}

	if (case_.contextMessageId) {
		const [contextMessage] = await sql<[{ channel_id: Snowflake | null }?]>`
			select channel_id
			from messages
			where id = ${case_.contextMessageId}
		`;

		if (Reflect.has(contextMessage ?? {}, "channel_id")) {
			msg += i18next.t("log.mod_log.case_log.context", {
				link: hyperlink(
					i18next.t("log.mod_log.case_log.context_sub", { lng: locale }),
					messageLink(contextMessage!.channel_id!, case_.contextMessageId, case_.guildId),
				),
				lng: locale,
			});
		}
	}

	if (case_.reason) {
		msg += i18next.t("log.mod_log.case_log.reason", { reason: case_.reason, lng: locale });
	} else {
		msg += i18next.t("log.mod_log.case_log.reason_fallback", { case_id: case_.caseId, lng: locale });
	}

	if (case_.refId) {
		const [reference] = await sql<[{ action: CaseAction; log_message_id: Snowflake | null }?]>`
			select action, log_message_id
			from cases
			where guild_id = ${case_.guildId}
				and case_id = ${case_.refId}
		`;

		if (Reflect.has(reference ?? {}, "action") && Reflect.has(reference ?? {}, "log_message_id")) {
			msg += i18next.t("log.mod_log.case_log.case_reference", {
				ref: hyperlink(`#${case_.refId}`, messageLink(logChannelId, reference!.log_message_id!, case_.guildId)),
				action: caseActionLabel(reference!.action, locale),
				lng: locale,
			});
		}
	}

	if (case_.reportRefId) {
		const reportsChannelId = await getGuildSetting(case_.guildId, SettingsKeys.ReportChannelId);

		const [reference] = await sql<[{ log_post_id: Snowflake | null }?]>`
			select log_post_id
			from reports
			where guild_id = ${case_.guildId}
				and report_id = ${case_.reportRefId}
		`;

		if (reportsChannelId && Reflect.has(reference ?? {}, "log_post_id")) {
			msg += i18next.t("log.mod_log.case_log.report_reference", {
				report_ref: hyperlink(`#${case_.reportRefId}`, channelLink(reference!.log_post_id!, case_.guildId)),
				lng: locale,
			});
		}
	}

	return msg;
}

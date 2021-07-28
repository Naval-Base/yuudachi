import { Client, Formatters, Snowflake } from 'discord.js';
import i18next from 'i18next';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';

import { kSQL } from '../../tokens';
import { generateMessageLink } from '../../util/generateMessageLink';
import { Case, CaseAction } from '../cases/createCase';

export async function generateCaseLog(client: Client, case_: Case, logChannelId: Snowflake, locale: string) {
	const sql = container.resolve<Sql<any>>(kSQL);

	let action = CaseAction[case_.action];
	if ((case_.action === CaseAction.Role || case_.action === CaseAction.Unrole) && case_.roleId) {
		const role = client.guilds.cache
			.get(case_.guildId)
			?.members.cache.get(case_.targetId)
			?.roles.cache.get(case_.roleId);
		if (role) {
			action += ` \`${role.name}\` (${case_.roleId})`;
		}
	}

	let msg = i18next.t('log.mod_log.case_log.description', {
		targetTag: case_.targetTag,
		targetId: case_.targetId,
		action,
		lng: locale,
	});

	if (case_.actionExpiration) {
		msg += i18next.t('log.mod_log.case_log.expiration', {
			time: Formatters.time(new Date(case_.actionExpiration), Formatters.TimestampStyles.RelativeTime),
			lng: locale,
		});
	}

	if (case_.contextMessageId) {
		const [contextMessage] = await sql<[{ channel_id: Snowflake | null }?]>`
			select channel_id
			from messages
			where id = ${case_.contextMessageId}`;

		if (Reflect.has(contextMessage ?? {}, 'channel_id')) {
			msg += i18next.t('log.mod_log.case_log.context', {
				link: Formatters.hyperlink(
					i18next.t('log.mod_log.case_log.context_sub', { lng: locale }),
					generateMessageLink(case_.guildId, contextMessage!.channel_id!, case_.contextMessageId),
				),
				lng: locale,
			});
		}
	}

	if (case_.reason) {
		msg += i18next.t('log.mod_log.case_log.reason', { reason: case_.reason, lng: locale });
	} else {
		msg += i18next.t('log.mod_log.case_log.reason_fallback', { caseId: case_.caseId, lng: locale });
	}

	if (case_.referenceId) {
		const [reference] = await sql<[{ log_message_id: Snowflake | null }?]>`
			select log_message_id
			from cases
			where guild_id = ${case_.guildId}
				and case_id = ${case_.referenceId}`;

		if (Reflect.has(reference ?? {}, 'log_message_id')) {
			msg += i18next.t('log.mod_log.case_log.reference', {
				ref: Formatters.hyperlink(
					`#${case_.referenceId}`,
					generateMessageLink(case_.guildId, logChannelId, reference!.log_message_id!),
				),
				lng: locale,
			});
		}
	}

	return msg;
}

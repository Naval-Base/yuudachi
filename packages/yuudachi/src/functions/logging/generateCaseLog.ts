import { Client, type Snowflake, hyperlink, time, TimestampStyles, messageLink } from 'discord.js';
import i18next from 'i18next';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';
import { logger } from '../../logger.js';
import { kSQL } from '../../tokens.js';
import { type Case, CaseAction } from '../cases/createCase.js';

export async function generateCaseLog(case_: Case, logChannelId: Snowflake, locale: string) {
	const client = container.resolve<Client<true>>(Client);
	const sql = container.resolve<Sql<any>>(kSQL);

	let action = CaseAction[case_.action];

	if ((case_.action === CaseAction.Role || case_.action === CaseAction.Unrole) && case_.roleId) {
		try {
			const guild = client.guilds.cache.get(case_.guildId)!;
			const role = guild.roles.cache.get(case_.roleId);

			if (role) {
				action += ` \`${role.name}\` (${role.id})`;
			} else {
				action += ` \`Unknown\` (${case_.roleId})`;
			}
		} catch (e) {
			const error = e as Error;
			logger.error(error, error.message);
		}
	}

	let msg = i18next.t('log.mod_log.case_log.description', {
		target_tag: case_.targetTag,
		target_id: case_.targetId,
		action,
		lng: locale,
	});

	if (case_.actionExpiration) {
		msg += i18next.t('log.mod_log.case_log.expiration', {
			time: time(new Date(case_.actionExpiration), TimestampStyles.RelativeTime),
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
				link: hyperlink(
					i18next.t('log.mod_log.case_log.context_sub', { lng: locale }),
					messageLink(contextMessage!.channel_id!, case_.contextMessageId, case_.guildId),
				),
				lng: locale,
			});
		}
	}

	if (case_.reason) {
		msg += i18next.t('log.mod_log.case_log.reason', { reason: case_.reason, lng: locale });
	} else {
		msg += i18next.t('log.mod_log.case_log.reason_fallback', { case_id: case_.caseId, lng: locale });
	}

	if (case_.referenceId) {
		const [reference] = await sql<[{ log_message_id: Snowflake | null }?]>`
			select log_message_id
			from cases
			where guild_id = ${case_.guildId}
				and case_id = ${case_.referenceId}`;

		if (Reflect.has(reference ?? {}, 'log_message_id')) {
			msg += i18next.t('log.mod_log.case_log.reference', {
				ref: hyperlink(`#${case_.referenceId}`, messageLink(logChannelId, reference!.log_message_id!, case_.guildId)),
				lng: locale,
			});
		}
	}

	return msg;
}

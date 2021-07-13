import { stripIndents } from 'common-tags';
import dayjs from 'dayjs';
import type { ButtonInteraction, CommandInteraction, SelectMenuInteraction, Snowflake } from 'discord.js';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';

import { kSQL } from '../../tokens';
import { Case, CaseAction } from '../cases/createCase';

export async function generateCaseLog(
	interaction: CommandInteraction | ButtonInteraction | SelectMenuInteraction,
	case_: Case,
	logChannelId: Snowflake,
) {
	const sql = container.resolve<Sql<any>>(kSQL);

	let action = CaseAction[case_.action];
	if ((case_.action === CaseAction.Role || case_.action === CaseAction.Unrole) && case_.roleId) {
		const role = interaction.client.guilds.cache
			.get(case_.guildId)
			?.members.cache.get(case_.targetId)
			?.roles.cache.get(case_.roleId);
		if (role) {
			action += ` \`${role.name}\` (${case_.roleId})`;
		}
	}

	let msg = stripIndents`
		**Member:** \`${case_.targetTag}\` (${case_.targetId})
		**Action:** ${action[0].toUpperCase() + action.substr(1).toLowerCase()}
	`;

	if (case_.actionExpiration) {
		msg += `\n**Expiration:** ${dayjs(case_.actionExpiration).from(case_.createdAt, true)}`;
	}

	if (case_.contextMessageId) {
		const [contextMessage] = await sql<[{ channel_id: string }?]>`
			select channel_id
			from messages
			where id = ${case_.contextMessageId}`;

		if (Reflect.has(contextMessage ?? {}, 'channel_id')) {
			msg += `\n**Context:** [Beam me up, Yuu](https://discordapp.com/channels/${case_.guildId}/${
				contextMessage!.channel_id
			}/${case_.contextMessageId})`;
		}
	}

	if (case_.reason) {
		msg += `\n**Reason:** ${case_.reason}`;
	} else {
		msg += `\n**Reason:** Use \`/reason ${case_.caseId} <...reason>\` to set a reason for this case`;
	}

	if (case_.referenceId) {
		const [reference] = await sql<[{ log_message_id: string | null }?]>`
			select log_message_id
			from cases
			where guild_id = ${case_.guildId}
				and case_id = ${case_.referenceId}`;

		if (Reflect.has(reference ?? {}, 'log_message_id')) {
			msg += `\n**Ref case:** [${case_.referenceId}](https://discordapp.com/channels/${
				case_.guildId
			}/${logChannelId}/${reference!.log_message_id!})`;
		}
	}

	return msg;
}

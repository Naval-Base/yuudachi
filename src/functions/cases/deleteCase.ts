import type { ButtonInteraction, CommandInteraction, SelectMenuInteraction } from 'discord.js';
import { container } from 'tsyringe';
import type { Sql } from 'postgres';

import { kSQL } from '../../tokens';
import type { RawCase } from './transformCase';
import { CaseAction, createCase } from './createCase';
import { generateCasePayload } from '../logs/generateCasePayload';

export async function deleteCase(
	interaction: CommandInteraction | ButtonInteraction | SelectMenuInteraction,
	caseId: number,
	manual = false,
) {
	const sql = container.resolve<Sql<any>>(kSQL);

	const [case_] = await sql<[RawCase]>`
		select *
		from cases
		where guild_id = ${interaction.guildId}
			and case_id = ${caseId}`;

	await sql`
		update cases
		set action_processed = true
		where guild_id = ${interaction.guildId}
			and case_id = ${caseId}`;

	let reason;
	if (manual) {
		if (case_.action === CaseAction.Ban) {
			reason = 'Manual unban';
		} else {
			reason = 'Manual unrole';
		}
	} else if (case_.action === CaseAction.Ban) {
		reason = 'Automatic unban based on duraton';
	} else {
		reason = 'Automatic unrole based on duration';
	}

	return createCase(
		interaction,
		generateCasePayload(
			interaction,
			{
				reason,
				user: {
					user: await interaction.client.users.fetch(case_.target_id),
					member: await interaction.guild?.members.fetch(case_.target_id),
				},
				reference: case_.case_id,
			},
			case_.action === CaseAction.Ban ? CaseAction.Unban : CaseAction.Unrole,
		),
	);
}

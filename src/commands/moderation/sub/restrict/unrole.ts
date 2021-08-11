import { ButtonInteraction, CommandInteraction, MessageActionRow, MessageButton, Snowflake } from 'discord.js';
import i18next from 'i18next';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';
import { nanoid } from 'nanoid';

import type { RestrictCommand } from '../../../../interactions';
import type { ArgumentsOf } from '../../../../interactions/ArgumentsOf';
import { kSQL } from '../../../../tokens';
import { deleteCase } from '../../../../functions/cases/deleteCase';
import { upsertCaseLog } from '../../../../functions/logs/upsertCaseLog';

export async function unrole(
	interaction: CommandInteraction,
	args: ArgumentsOf<typeof RestrictCommand>['unrole'],
	locale: string,
): Promise<void> {
	const sql = container.resolve<Sql<any>>(kSQL);

	const [action] = await sql<[{ action_processed: boolean; target_id: Snowflake; role_id: Snowflake | null }?]>`
		select action_processed, target_id, role_id
		from cases
		where guild_id = ${interaction.guildId}
			and case_id = ${args.case}`;

	if (!action) {
		throw new Error(i18next.t('command.mod.common.errors.no_case', { case: args.case, lng: locale }));
	}

	if (action.action_processed) {
		const user = await interaction.client.users.fetch(action.target_id);
		throw new Error(
			i18next.t('command.mod.restrict.unrole.errors.already_processed', {
				user: `${user.toString()} - ${user.tag} (${user.id})`,
				case: args.case,
				lng: locale,
			}),
		);
	}

	const user = await interaction.client.users.fetch(action.target_id);
	let role = null;
	try {
		role = await interaction.guild!.roles.fetch(action.role_id!, { force: true });
	} catch {}

	const unroleKey = nanoid();
	const cancelKey = nanoid();

	const roleButton = new MessageButton()
		.setCustomId(unroleKey)
		.setLabel(i18next.t('command.mod.restrict.unrole.buttons.execute', { lng: locale }))
		.setStyle('DANGER');
	const cancelButton = new MessageButton()
		.setCustomId(cancelKey)
		.setLabel(i18next.t('command.mod.restrict.unrole.buttons.cancel', { lng: locale }))
		.setStyle('SECONDARY');

	await interaction.editReply({
		content: i18next.t('command.mod.restrict.unrole.pending', {
			case: args.case,
			lng: locale,
		}),
		components: [new MessageActionRow().addComponents([cancelButton, roleButton])],
	});

	const collectedInteraction = await interaction.channel
		?.awaitMessageComponent<ButtonInteraction>({
			filter: (collected) => collected.user.id === interaction.user.id,
			componentType: 'BUTTON',
			time: 15000,
		})
		.catch(async () => {
			try {
				await interaction.editReply({
					content: i18next.t('common.errors.timed_out', { lng: locale }),
					components: [],
				});
			} catch {}
		});

	if (collectedInteraction?.customId === cancelKey) {
		await collectedInteraction.update({
			content: i18next.t('command.mod.restrict.unrole.cancel', {
				user: `${user.toString()} - ${user.tag} (${user.id})`,
				role: role ? `${role.toString()} - ${role.name} (${role.id})` : 'Unknown',
				case: args.case,
				lng: locale,
			}),
			components: [],
		});
	} else if (collectedInteraction?.customId === unroleKey) {
		await collectedInteraction.deferUpdate();

		const case_ = await deleteCase({
			guild: collectedInteraction.guild!,
			user: collectedInteraction.user,
			caseId: args.case,
			manual: true,
		});
		await upsertCaseLog(collectedInteraction.guildId!, collectedInteraction.user, case_);

		await collectedInteraction.editReply({
			content: i18next.t('command.mod.restrict.unrole.success', {
				user: `${user.toString()} - ${user.tag} (${user.id})`,
				role: role ? `${role.toString()} - ${role.name} (${role.id})` : 'Unknown',
				case: args.case,
				lng: locale,
			}),
			components: [],
		});
	}
}

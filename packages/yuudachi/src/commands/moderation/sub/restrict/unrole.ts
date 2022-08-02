import { type Snowflake, ButtonStyle, ComponentType, type InteractionResponse } from 'discord.js';
import i18next from 'i18next';
import { nanoid } from 'nanoid';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';
import type { InteractionParam, ArgsParam, LocaleParam } from '../../../../Command.js';
import { deleteCase } from '../../../../functions/cases/deleteCase.js';
import { upsertCaseLog } from '../../../../functions/logging/upsertCaseLog.js';
import type { RestrictCommand } from '../../../../interactions/index.js';
import { kSQL } from '../../../../tokens.js';
import { createButton } from '../../../../util/button.js';
import { createMessageActionRow } from '../../../../util/messageActionRow.js';

export async function unrole(
	interaction: InteractionParam,
	reply: InteractionResponse<true>,
	args: ArgsParam<typeof RestrictCommand>['unrole'],
	locale: LocaleParam,
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
		role = await interaction.guild.roles.fetch(action.role_id!, { force: true });
	} catch {}

	const unroleKey = nanoid();
	const cancelKey = nanoid();

	const roleButton = createButton({
		customId: unroleKey,
		label: i18next.t('command.mod.restrict.unrole.buttons.execute', { lng: locale }),
		style: ButtonStyle.Danger,
	});
	const cancelButton = createButton({
		customId: cancelKey,
		label: i18next.t('command.common.buttons.cancel', { lng: locale }),
		style: ButtonStyle.Secondary,
	});

	await interaction.editReply({
		content: i18next.t('command.mod.restrict.unrole.pending', {
			user: `${user.toString()} - ${user.tag} (${user.id})`,
			role: role ? `${role.toString()} - ${role.name} (${role.id})` : 'Unknown',
			case: args.case,
			lng: locale,
		}),
		components: [createMessageActionRow([cancelButton, roleButton])],
	});

	const collectedInteraction = await reply
		.awaitMessageComponent({
			filter: (collected) => collected.user.id === interaction.user.id,
			componentType: ComponentType.Button,
			time: 15000,
		})
		.catch(async () => {
			try {
				await interaction.editReply({
					content: i18next.t('command.common.errors.timed_out', { lng: locale }),
					components: [],
				});
			} catch {}
			return undefined;
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
			guild: collectedInteraction.guild,
			user: collectedInteraction.user,
			caseId: args.case,
			manual: true,
		});
		await upsertCaseLog(collectedInteraction.guild, collectedInteraction.user, case_);

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

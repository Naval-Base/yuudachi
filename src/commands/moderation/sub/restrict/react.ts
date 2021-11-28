import { BaseCommandInteraction, Message, MessageActionRow, MessageButton, Snowflake } from 'discord.js';
import i18next from 'i18next';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';
import { ms } from '@naval-base/ms';
import { nanoid } from 'nanoid';
import type { APIMessage } from 'discord-api-types';

import type { RestrictCommand } from '../../../../interactions';
import type { ArgumentsOf } from '../../../../interactions/ArgumentsOf';
import { kSQL } from '../../../../tokens';
import { CaseAction, createCase } from '../../../../functions/cases/createCase';
import { generateCasePayload } from '../../../../functions/logs/generateCasePayload';
import { upsertCaseLog } from '../../../../functions/logs/upsertCaseLog';
import { generateHistory } from '../../../../util/generateHistory';
import { awaitComponent } from '../../../../util/awaitComponent';

export async function react(
	interaction: BaseCommandInteraction,
	reply: Message | APIMessage,
	args: ArgumentsOf<typeof RestrictCommand>['react'],
	locale: string,
): Promise<void> {
	if (args.reason && args.reason.length >= 500) {
		throw new Error(i18next.t('command.mod.common.errors.max_length_reason', { lng: locale }));
	}

	const sql = container.resolve<Sql<any>>(kSQL);

	const [roles] = await sql<[{ reaction_role_id: Snowflake | null }?]>`
		select reaction_role_id
		from guild_settings
		where guild_id = ${interaction.guildId}`;

	if (!roles?.reaction_role_id) {
		throw new Error(i18next.t('command.mod.restrict.react.errors.no_role', { lng: locale }));
	}

	const [action] = await sql<[{ action_processed: boolean }?]>`
		select action_processed
		from cases
		where guild_id = ${interaction.guildId}
			and target_id = ${args.user.user.id}
			and role_id = ${roles.reaction_role_id}
		order by created_at desc
		limit 1`;

	if (action && !action.action_processed) {
		throw new Error(
			i18next.t('command.mod.restrict.react.errors.already_restricted', {
				user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
				lng: locale,
			}),
		);
	}

	const parsedDuration = ms(args.duration);
	if (parsedDuration < 300000 || isNaN(parsedDuration)) {
		throw new Error(i18next.t('command.common.errors.duration_format', { lng: locale }));
	}

	const roleKey = nanoid();
	const cancelKey = nanoid();

	const embed = await generateHistory(interaction, args.user, locale);

	const roleButton = new MessageButton()
		.setCustomId(roleKey)
		.setLabel(i18next.t('command.mod.restrict.react.buttons.execute', { lng: locale }))
		.setStyle('DANGER');
	const cancelButton = new MessageButton()
		.setCustomId(cancelKey)
		.setLabel(i18next.t('command.mod.restrict.react.buttons.cancel', { lng: locale }))
		.setStyle('SECONDARY');

	await interaction.editReply({
		content: i18next.t('command.mod.restrict.react.pending', {
			user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
			lng: locale,
		}),
		embeds: [embed],
		components: [new MessageActionRow().addComponents([cancelButton, roleButton])],
	});

	const collectedInteraction = await awaitComponent(interaction.client, reply, {
		filter: (collected) => collected.user.id === interaction.user.id,
		componentType: 'BUTTON',
		time: 15000,
	}).catch(async () => {
		try {
			await interaction.editReply({
				content: i18next.t('common.errors.timed_out', { lng: locale }),
				components: [],
			});
		} catch {}
		return undefined;
	});

	if (collectedInteraction?.customId === cancelKey) {
		await collectedInteraction.update({
			content: i18next.t('command.mod.restrict.react.cancel', {
				user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
				lng: locale,
			}),
			components: [],
		});
	} else if (collectedInteraction?.customId === roleKey) {
		await collectedInteraction.deferUpdate();

		const case_ = await createCase(
			collectedInteraction.guild!,
			generateCasePayload({
				guildId: collectedInteraction.guildId!,
				user: collectedInteraction.user,
				roleId: roles.reaction_role_id,
				args,
				action: CaseAction.Role,
				duration: parsedDuration,
			}),
		);
		await upsertCaseLog(collectedInteraction.guildId!, collectedInteraction.user, case_);

		await collectedInteraction.editReply({
			content: i18next.t('command.mod.restrict.react.success', {
				user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
				lng: locale,
			}),
			components: [],
		});
	}
}

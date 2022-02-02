import { ms } from '@naval-base/ms';
import type { APIMessage } from 'discord-api-types';
import {
	type CommandInteraction,
	type ButtonInteraction,
	type Message,
	ActionRow,
	ButtonComponent,
	type Snowflake,
	ButtonStyle,
	ComponentType,
} from 'discord.js';
import i18next from 'i18next';
import { nanoid } from 'nanoid';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';
import { CaseAction, createCase } from '../../../../functions/cases/createCase';
import { generateCasePayload } from '../../../../functions/logs/generateCasePayload';
import { upsertCaseLog } from '../../../../functions/logs/upsertCaseLog';
import type { RestrictCommand } from '../../../../interactions';
import type { ArgumentsOf } from '../../../../interactions/ArgumentsOf';
import { kSQL } from '../../../../tokens';
import { awaitComponent } from '../../../../util/awaitComponent';
import { generateHistory } from '../../../../util/generateHistory';

export async function emoji(
	interaction: CommandInteraction<'cached'>,
	reply: Message | APIMessage,
	args: ArgumentsOf<typeof RestrictCommand>['emoji'],
	locale: string,
): Promise<void> {
	if (args.reason && args.reason.length >= 500) {
		throw new Error(i18next.t('command.mod.common.errors.max_length_reason', { lng: locale }));
	}

	const sql = container.resolve<Sql<any>>(kSQL);

	const [roles] = await sql<[{ emoji_role_id: Snowflake | null }?]>`
		select emoji_role_id
		from guild_settings
		where guild_id = ${interaction.guildId}`;

	if (!roles?.emoji_role_id) {
		throw new Error(i18next.t('command.mod.restrict.emoji.errors.no_role', { lng: locale }));
	}

	const [action] = await sql<[{ action_processed: boolean }?]>`
		select action_processed
		from cases
		where guild_id = ${interaction.guildId}
			and target_id = ${args.user.user.id}
			and role_id = ${roles.emoji_role_id}
		order by created_at desc
		limit 1`;

	if (action && !action.action_processed) {
		throw new Error(
			i18next.t('command.mod.restrict.emoji.errors.already_restricted', {
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

	const roleButton = new ButtonComponent()
		.setCustomId(roleKey)
		.setLabel(i18next.t('command.mod.restrict.emoji.buttons.execute', { lng: locale }))
		.setStyle(ButtonStyle.Danger);
	const cancelButton = new ButtonComponent()
		.setCustomId(cancelKey)
		.setLabel(i18next.t('command.mod.restrict.emoji.buttons.cancel', { lng: locale }))
		.setStyle(ButtonStyle.Secondary);

	await interaction.editReply({
		content: i18next.t('command.mod.restrict.emoji.pending', {
			user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
			lng: locale,
		}),
		embeds: [embed],
		components: [new ActionRow().addComponents(cancelButton, roleButton)],
	});

	const collectedInteraction = (await awaitComponent(interaction.client, reply, {
		filter: (collected) => collected.user.id === interaction.user.id,
		componentType: ComponentType.Button,
		time: 15000,
	}).catch(async () => {
		try {
			await interaction.editReply({
				content: i18next.t('common.errors.timed_out', { lng: locale }),
				components: [],
			});
		} catch {}
		return undefined;
	})) as ButtonInteraction<'cached'> | undefined;

	if (collectedInteraction?.customId === cancelKey) {
		await collectedInteraction.update({
			content: i18next.t('command.mod.restrict.emoji.cancel', {
				user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
				lng: locale,
			}),
			components: [],
		});
	} else if (collectedInteraction?.customId === roleKey) {
		await collectedInteraction.deferUpdate();

		const case_ = await createCase(
			collectedInteraction.guild,
			generateCasePayload({
				guildId: collectedInteraction.guildId,
				user: collectedInteraction.user,
				roleId: roles.emoji_role_id,
				args,
				action: CaseAction.Role,
				duration: parsedDuration,
			}),
		);
		void upsertCaseLog(collectedInteraction.guildId, collectedInteraction.user, case_);

		await collectedInteraction.editReply({
			content: i18next.t('command.mod.restrict.emoji.success', {
				user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
				lng: locale,
			}),
			components: [],
		});
	}
}

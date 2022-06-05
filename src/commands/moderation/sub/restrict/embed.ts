import { ms } from '@naval-base/ms';
import {
	type CommandInteraction,
	type Snowflake,
	ButtonStyle,
	ComponentType,
	type InteractionResponse,
} from 'discord.js';
import i18next from 'i18next';
import { nanoid } from 'nanoid';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';
import { CaseAction, createCase } from '../../../../functions/cases/createCase.js';
import { generateCasePayload } from '../../../../functions/logs/generateCasePayload.js';
import { upsertCaseLog } from '../../../../functions/logs/upsertCaseLog.js';
import type { ArgumentsOf } from '../../../../interactions/ArgumentsOf.js';
import type { RestrictCommand } from '../../../../interactions/index.js';
import { kSQL } from '../../../../tokens.js';
import { createButton } from '../../../../util/button.js';
import { generateHistory } from '../../../../util/generateHistory.js';
import { createMessageActionRow } from '../../../../util/messageActionRow.js';

export async function embed(
	interaction: CommandInteraction<'cached'>,
	reply: InteractionResponse<true>,
	args: ArgumentsOf<typeof RestrictCommand>['embed'],
	locale: string,
): Promise<void> {
	if (args.reason && args.reason.length >= 500) {
		throw new Error(i18next.t('command.mod.common.errors.max_length_reason', { lng: locale }));
	}

	const sql = container.resolve<Sql<any>>(kSQL);

	const [roles] = await sql<[{ embed_role_id: Snowflake | null }?]>`
		select embed_role_id
		from guild_settings
		where guild_id = ${interaction.guildId}`;

	if (!roles?.embed_role_id) {
		throw new Error(i18next.t('command.mod.restrict.embed.errors.no_role', { lng: locale }));
	}

	const [action] = await sql<[{ action_processed: boolean }?]>`
		select action_processed
		from cases
		where guild_id = ${interaction.guildId}
			and target_id = ${args.user.user.id}
			and role_id = ${roles.embed_role_id}
		order by created_at desc
		limit 1`;

	if (action && !action.action_processed) {
		throw new Error(
			i18next.t('command.mod.restrict.embed.errors.already_restricted', {
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

	const roleButton = createButton({
		customId: roleKey,
		label: i18next.t('command.mod.restrict.embed.buttons.execute', { lng: locale }),
		style: ButtonStyle.Danger,
	});
	const cancelButton = createButton({
		customId: cancelKey,
		label: i18next.t('command.mod.restrict.embed.buttons.cancel', { lng: locale }),
		style: ButtonStyle.Secondary,
	});

	await interaction.editReply({
		content: i18next.t('command.mod.restrict.embed.pending', {
			user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
			lng: locale,
		}),
		embeds: [embed],
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
					content: i18next.t('common.errors.timed_out', { lng: locale }),
					components: [],
				});
			} catch {}
			return undefined;
		});

	if (collectedInteraction?.customId === cancelKey) {
		await collectedInteraction.update({
			content: i18next.t('command.mod.restrict.embed.cancel', {
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
				roleId: roles.embed_role_id,
				args,
				action: CaseAction.Role,
				duration: parsedDuration,
			}),
		);
		void upsertCaseLog(collectedInteraction.guildId, collectedInteraction.user, case_);

		await collectedInteraction.editReply({
			content: i18next.t('command.mod.restrict.embed.success', {
				user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
				lng: locale,
			}),
			components: [],
		});
	}
}

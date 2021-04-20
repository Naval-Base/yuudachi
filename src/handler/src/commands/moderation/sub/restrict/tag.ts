import type { APIGuildInteraction, Snowflake } from 'discord-api-types/v8';
import i18next from 'i18next';
import API, { HttpException } from '@yuudachi/api';
import { container } from 'tsyringe';
import ms from '@naval-base/ms';
import type { Sql } from 'postgres';
import { CaseAction } from '@yuudachi/types';
import type { ArgumentsOf, RestrictCommand } from '@yuudachi/interactions';
import { Tokens } from '@yuudachi/core';

import { send } from '../../../../util';

const { kSQL } = Tokens;

export async function tag(
	message: APIGuildInteraction,
	args: ArgumentsOf<typeof RestrictCommand>['tag'],
	locale: string,
) {
	if (args.reason && args.reason.length >= 1900) {
		throw new Error(i18next.t('command.mod.common.errors.max_length_reason', { lng: locale }));
	}

	const sql = container.resolve<Sql<any>>(kSQL);
	const api = container.resolve(API);

	const [roles] = await sql<[{ tag_role_id: Snowflake | '' | null }?]>`
		select tag_role_id
		from guild_settings
		where guild_id = ${message.guild_id}
	`;

	if (!roles?.tag_role_id) {
		throw new Error(i18next.t('command.mod.restrict.tag.errors.no_role', { lng: locale }));
	}

	const [action] = await sql<[{ action_processed: boolean }?]>`
		select action_processed
		from cases
		where guild_id = ${message.guild_id}
			and target_id = ${args.user.user.id}
			and role_id = ${roles.tag_role_id}
		order by created_at desc
		limit 1`;

	if (action && !action.action_processed) {
		throw new Error(i18next.t('command.mod.restrict.tag.errors.already_restricted', { lng: locale }));
	}

	const parsedDuration = ms(args.duration);
	if (parsedDuration < 300000 || isNaN(parsedDuration)) {
		throw new Error(i18next.t('command.common.errors.duration_format', { lng: locale }));
	}

	const memberMention = `<@${args.user.user.id}>`;

	try {
		await api.guilds.createCase(message.guild_id, {
			action: CaseAction.ROLE,
			reason: args.reason,
			moderatorId: message.member.user.id,
			targetId: args.user.user.id,
			roleId: roles.tag_role_id,
			contextMessageId: message.id,
			referenceId: args.reference ? Number(args.reference) : undefined,
			actionExpiration: new Date(Date.now() + parsedDuration),
		});

		void send(message, {
			content: i18next.t('command.mod.restrict.tag.success', { member: memberMention, lng: locale }),
		});
	} catch (e) {
		if (e instanceof HttpException) {
			switch (e.status) {
				case 403:
					throw new Error(i18next.t('command.mod.restrict.tag.errors.missing_permissions', { lng: locale }));
				case 404:
					throw new Error(i18next.t('command.common.errors.target_not_found', { lng: locale }));
			}
		}
		throw new Error(i18next.t('command.mod.restrict.tag.errors.failure', { member: memberMention, lng: locale }));
	}
}

import type { APIGuildInteraction } from 'discord-api-types/v8';
import API, { HttpException } from '@yuudachi/api';
import { CaseAction, CommandModules } from '@yuudachi/types';
import type { ArgumentsOf, UnbanCommand } from '@yuudachi/interactions';
import i18next from 'i18next';
import { inject, injectable } from 'tsyringe';
import type { Sql } from 'postgres';
import { Tokens } from '@yuudachi/core';

import Command from '../../Command';
import { checkMod, send } from '../../util';

const { kSQL } = Tokens;

@injectable()
export default class implements Command {
	public readonly category = CommandModules.Moderation;

	public constructor(private readonly api: API, @inject(kSQL) private readonly sql: Sql<any>) {}

	private parse(args: ArgumentsOf<typeof UnbanCommand>) {
		return {
			member: args.user,
			reason: args.reason,
			refId: args.reference,
		};
	}

	public async execute(
		message: APIGuildInteraction,
		args: ArgumentsOf<typeof UnbanCommand>,
		locale: string,
	): Promise<void> {
		await checkMod(message, locale);

		const { member, reason, refId } = this.parse(args);
		if (reason && reason.length >= 1900) {
			throw new Error(i18next.t('command.mod.common.errors.max_length_reason', { lng: locale }));
		}

		const memberMention = `<@${member.user.id}>`;

		try {
			const [case_] = await this.sql<[{ case_id: number }?]>`
				select case_id
				from cases
				where guild_id = ${message.guild_id}
					and target_id = ${member.user.id}
					and action = ${CaseAction.BAN}
				order by created_at desc
				limit 1`;

			await this.api.guilds.createCase(message.guild_id, {
				action: CaseAction.UNBAN,
				reason: reason ?? undefined,
				moderatorId: message.member.user.id,
				targetId: member.user.id,
				contextMessageId: message.id,
				referenceId: refId ? Number(refId) : case_?.case_id ? Number(case_.case_id) : undefined,
			});

			void send(message, {
				content: i18next.t('command.mod.unban.success', { member: memberMention, lng: locale }),
			});
		} catch (e) {
			if (e instanceof HttpException) {
				switch (e.status) {
					case 403:
						throw new Error(i18next.t('command.mod.unban.errors.missing_permissions', { lng: locale }));
					case 404:
						throw new Error(i18next.t('common.errors.target_not_found', { lng: locale }));
				}
			}
			throw new Error(i18next.t('command.mod.unban.errors.failure', { member: memberMention, lng: locale }));
		}
	}
}

import type { APIGuildInteraction, Snowflake } from 'discord-api-types/v8';
import { container } from 'tsyringe';
import i18next from 'i18next';
import { Tokens } from '@yuudachi/core';
import type { Sql } from 'postgres';

const { kSQL } = Tokens;

export async function checkMod(message: APIGuildInteraction, locale: string): Promise<void> {
	const sql = container.resolve<Sql<any>>(kSQL);

	const [data] = await sql<[{ mod_role_id: Snowflake | null }?]>`
		select mod_role_id
		from guild_settings
		where guild_id = ${message.guild_id}`;

	if (data?.mod_role_id && !message.member.roles.includes(data.mod_role_id)) {
		throw new Error(i18next.t('command.common.errors.no_mod_role', { lng: locale }));
	}
}

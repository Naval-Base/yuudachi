import type { ButtonInteraction, CommandInteraction, GuildMember, SelectMenuInteraction, Snowflake } from 'discord.js';
import { container } from 'tsyringe';
import i18next from 'i18next';
import type { Sql } from 'postgres';

import { kSQL } from '../tokens';

export async function checkModRole(
	interaction: CommandInteraction | ButtonInteraction | SelectMenuInteraction,
	locale: string,
): Promise<void> {
	const sql = container.resolve<Sql<any>>(kSQL);

	const [data] = await sql<[{ mod_role_id: Snowflake | null }?]>`
		select mod_role_id
		from guild_settings
		where guild_id = ${interaction.guildId}`;

	if (data?.mod_role_id && !(interaction.member as GuildMember).roles.cache.has(data.mod_role_id)) {
		throw new Error(i18next.t('common.errors.no_mod_role', { lng: locale }));
	}
}

/**
 * @param {import('postgres').Sql} sql
 */
export async function up(sql) {
	await sql.unsafe(`
		create type guild_reports_restriction_level as enum ('enabled', 'restricted', 'blocked');

		alter table guild_settings
			add column reports_restriction_level guild_reports_restriction_level not null default 'enabled';

		alter table guild_settings
			add column reports_restriction_reason text default null;

		comment on column guild_settings.reports_restriction_reason is 'The reason why reports are blocked/restricted in this guild';
		comment on column guild_settings.reports_restriction_level is 'The restriction_level of reports in this guild, whether they are enabled, restricted (requires confirmation), or blocked';
	`);
}

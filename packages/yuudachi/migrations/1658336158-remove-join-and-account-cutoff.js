/** @param {import('postgres').Sql} sql */
export async function up(sql) {
	await sql.unsafe(`
		alter table cases
			drop join_cutof,
			drop account_cutoff
	`);
}

/** @param {import('postgres').Sql} sql */
export async function up(sql) {
	await sql.unsafe(`
		alter table cases
			drop join_cuttof,
			drop account_cutoff
	`);
}

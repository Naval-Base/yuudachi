export interface SearchQuery {
	header: string;
	key: 'case_id' | 'mod_id' | 'target_id' | string;
	op: '_eq' | '_ilike';
	query: string;
}

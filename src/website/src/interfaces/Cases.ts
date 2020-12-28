export interface GuildCase {
	action: number;
	action_expiration: string | null;
	action_processed: boolean;
	case_id: number;
	context_message_id: string | null;
	created_at: string;
	log_message_id: string | null;
	mod_id: string | null;
	mod_tag: string | null;
	reason: string | null;
	ref_id: number | null;
	role_id: string | null;
	target_id: string;
	target_tag: string;
}

export interface GraphQLGuildCases {
	data: {
		caseCount: {
			aggregate: {
				count: number;
			};
		};
		cases: GuildCase[];
	};
}

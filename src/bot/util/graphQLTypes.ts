export type Maybe<T> = T | null;
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
	ID: string;
	String: string;
	Boolean: boolean;
	Int: number;
	Float: number;
	timestamptz: string;
	uuid: string;
	_text: string[];
	jsonb: string;
}

/** expression to compare columns of type _text. All fields are combined with logical 'AND'. */
export interface TextComparisonExp {
	_eq?: Maybe<Scalars['_text']>;
	_gt?: Maybe<Scalars['_text']>;
	_gte?: Maybe<Scalars['_text']>;
	_in?: Maybe<Array<Scalars['_text']>>;
	_is_null?: Maybe<Scalars['Boolean']>;
	_lt?: Maybe<Scalars['_text']>;
	_lte?: Maybe<Scalars['_text']>;
	_neq?: Maybe<Scalars['_text']>;
	_nin?: Maybe<Array<Scalars['_text']>>;
}

/** expression to compare columns of type Boolean. All fields are combined with logical 'AND'. */
export interface BooleanComparisonExp {
	_eq?: Maybe<Scalars['Boolean']>;
	_gt?: Maybe<Scalars['Boolean']>;
	_gte?: Maybe<Scalars['Boolean']>;
	_in?: Maybe<Array<Scalars['Boolean']>>;
	_is_null?: Maybe<Scalars['Boolean']>;
	_lt?: Maybe<Scalars['Boolean']>;
	_lte?: Maybe<Scalars['Boolean']>;
	_neq?: Maybe<Scalars['Boolean']>;
	_nin?: Maybe<Array<Scalars['Boolean']>>;
}

/** columns and relationships of "cases" */
export interface Cases {
	action: Scalars['Int'];
	action_duration?: Maybe<Scalars['timestamptz']>;
	action_processed?: Maybe<Scalars['Boolean']>;
	case_id: Scalars['Int'];
	created_at: Scalars['timestamptz'];
	guild: Scalars['String'];
	id: Scalars['uuid'];
	message?: Maybe<Scalars['String']>;
	mod_id?: Maybe<Scalars['String']>;
	mod_tag?: Maybe<Scalars['String']>;
	reason?: Maybe<Scalars['String']>;
	ref_id?: Maybe<Scalars['Int']>;
	target_id: Scalars['String'];
	target_tag: Scalars['String'];
}

/** aggregated selection of "cases" */
export interface CasesAggregate {
	aggregate?: Maybe<CasesAggregateFields>;
	nodes: Array<Cases>;
}

/** aggregate fields of "cases" */
export interface CasesAggregateFields {
	avg?: Maybe<CasesAvgFields>;
	count?: Maybe<Scalars['Int']>;
	max?: Maybe<CasesMaxFields>;
	min?: Maybe<CasesMinFields>;
	stddev?: Maybe<CasesStddevFields>;
	stddev_pop?: Maybe<CasesStddevPopFields>;
	stddev_samp?: Maybe<CasesStddevSampFields>;
	sum?: Maybe<CasesSumFields>;
	var_pop?: Maybe<CasesVarPopFields>;
	var_samp?: Maybe<CasesVarSampFields>;
	variance?: Maybe<CasesVarianceFields>;
}

/** aggregate fields of "cases" */
export interface CasesAggregateFieldsCountArgs {
	columns?: Maybe<Array<CasesSelectColumn>>;
	distinct?: Maybe<Scalars['Boolean']>;
}

/** order by aggregate values of table "cases" */
export interface CasesAggregateOrderBy {
	avg?: Maybe<CasesAvgOrderBy>;
	count?: Maybe<OrderBy>;
	max?: Maybe<CasesMaxOrderBy>;
	min?: Maybe<CasesMinOrderBy>;
	stddev?: Maybe<CasesStddevOrderBy>;
	stddev_pop?: Maybe<CasesStddevPopOrderBy>;
	stddev_samp?: Maybe<CasesStddevSampOrderBy>;
	sum?: Maybe<CasesSumOrderBy>;
	var_pop?: Maybe<CasesVarPopOrderBy>;
	var_samp?: Maybe<CasesVarSampOrderBy>;
	variance?: Maybe<CasesVarianceOrderBy>;
}

/** input type for inserting array relation for remote table "cases" */
export interface CasesArrRelInsertInput {
	data: Array<CasesInsertInput>;
	on_conflict?: Maybe<CasesOnConflict>;
}

/** aggregate avg on columns */
export interface CasesAvgFields {
	action?: Maybe<Scalars['Float']>;
	case_id?: Maybe<Scalars['Float']>;
	ref_id?: Maybe<Scalars['Float']>;
}

/** order by avg() on columns of table "cases" */
export interface CasesAvgOrderBy {
	action?: Maybe<OrderBy>;
	case_id?: Maybe<OrderBy>;
	ref_id?: Maybe<OrderBy>;
}

/** Boolean expression to filter rows from the table "cases". All fields are combined with a logical 'AND'. */
export interface CasesBoolExp {
	_and?: Maybe<Array<Maybe<CasesBoolExp>>>;
	_not?: Maybe<CasesBoolExp>;
	_or?: Maybe<Array<Maybe<CasesBoolExp>>>;
	action?: Maybe<IntComparisonExp>;
	action_duration?: Maybe<TimestamptzComparisonExp>;
	action_processed?: Maybe<BooleanComparisonExp>;
	case_id?: Maybe<IntComparisonExp>;
	created_at?: Maybe<TimestamptzComparisonExp>;
	guild?: Maybe<StringComparisonExp>;
	id?: Maybe<UuidComparisonExp>;
	message?: Maybe<StringComparisonExp>;
	mod_id?: Maybe<StringComparisonExp>;
	mod_tag?: Maybe<StringComparisonExp>;
	reason?: Maybe<StringComparisonExp>;
	ref_id?: Maybe<IntComparisonExp>;
	target_id?: Maybe<StringComparisonExp>;
	target_tag?: Maybe<StringComparisonExp>;
}

/** unique or primary key constraints on table "cases" */
export enum CasesConstraint {
	/** unique or primary key constraint */
	CasesPkey = 'cases_pkey',
}

/** input type for incrementing integer columne in table "cases" */
export interface CasesIncInput {
	action?: Maybe<Scalars['Int']>;
	case_id?: Maybe<Scalars['Int']>;
	ref_id?: Maybe<Scalars['Int']>;
}

/** input type for inserting data into table "cases" */
export interface CasesInsertInput {
	action?: Maybe<Scalars['Int']>;
	action_duration?: Maybe<Scalars['timestamptz']>;
	action_processed?: Maybe<Scalars['Boolean']>;
	case_id?: Maybe<Scalars['Int']>;
	created_at?: Maybe<Scalars['timestamptz']>;
	guild?: Maybe<Scalars['String']>;
	id?: Maybe<Scalars['uuid']>;
	message?: Maybe<Scalars['String']>;
	mod_id?: Maybe<Scalars['String']>;
	mod_tag?: Maybe<Scalars['String']>;
	reason?: Maybe<Scalars['String']>;
	ref_id?: Maybe<Scalars['Int']>;
	target_id?: Maybe<Scalars['String']>;
	target_tag?: Maybe<Scalars['String']>;
}

/** aggregate max on columns */
export interface CasesMaxFields {
	action?: Maybe<Scalars['Int']>;
	action_duration?: Maybe<Scalars['timestamptz']>;
	case_id?: Maybe<Scalars['Int']>;
	created_at?: Maybe<Scalars['timestamptz']>;
	guild?: Maybe<Scalars['String']>;
	message?: Maybe<Scalars['String']>;
	mod_id?: Maybe<Scalars['String']>;
	mod_tag?: Maybe<Scalars['String']>;
	reason?: Maybe<Scalars['String']>;
	ref_id?: Maybe<Scalars['Int']>;
	target_id?: Maybe<Scalars['String']>;
	target_tag?: Maybe<Scalars['String']>;
}

/** order by max() on columns of table "cases" */
export interface CasesMaxOrderBy {
	action?: Maybe<OrderBy>;
	action_duration?: Maybe<OrderBy>;
	case_id?: Maybe<OrderBy>;
	created_at?: Maybe<OrderBy>;
	guild?: Maybe<OrderBy>;
	message?: Maybe<OrderBy>;
	mod_id?: Maybe<OrderBy>;
	mod_tag?: Maybe<OrderBy>;
	reason?: Maybe<OrderBy>;
	ref_id?: Maybe<OrderBy>;
	target_id?: Maybe<OrderBy>;
	target_tag?: Maybe<OrderBy>;
}

/** aggregate min on columns */
export interface CasesMinFields {
	action?: Maybe<Scalars['Int']>;
	action_duration?: Maybe<Scalars['timestamptz']>;
	case_id?: Maybe<Scalars['Int']>;
	created_at?: Maybe<Scalars['timestamptz']>;
	guild?: Maybe<Scalars['String']>;
	message?: Maybe<Scalars['String']>;
	mod_id?: Maybe<Scalars['String']>;
	mod_tag?: Maybe<Scalars['String']>;
	reason?: Maybe<Scalars['String']>;
	ref_id?: Maybe<Scalars['Int']>;
	target_id?: Maybe<Scalars['String']>;
	target_tag?: Maybe<Scalars['String']>;
}

/** order by min() on columns of table "cases" */
export interface CasesMinOrderBy {
	action?: Maybe<OrderBy>;
	action_duration?: Maybe<OrderBy>;
	case_id?: Maybe<OrderBy>;
	created_at?: Maybe<OrderBy>;
	guild?: Maybe<OrderBy>;
	message?: Maybe<OrderBy>;
	mod_id?: Maybe<OrderBy>;
	mod_tag?: Maybe<OrderBy>;
	reason?: Maybe<OrderBy>;
	ref_id?: Maybe<OrderBy>;
	target_id?: Maybe<OrderBy>;
	target_tag?: Maybe<OrderBy>;
}

/** response of any mutation on the table "cases" */
export interface CasesMutationResponse {
	/** number of affected rows by the mutation */
	affected_rows: Scalars['Int'];
	/** data of the affected rows by the mutation */
	returning: Array<Cases>;
}

/** input type for inserting object relation for remote table "cases" */
export interface CasesObjRelInsertInput {
	data: CasesInsertInput;
	on_conflict?: Maybe<CasesOnConflict>;
}

/** on conflict condition type for table "cases" */
export interface CasesOnConflict {
	constraint: CasesConstraint;
	update_columns: Array<CasesUpdateColumn>;
}

/** ordering options when selecting data from "cases" */
export interface CasesOrderBy {
	action?: Maybe<OrderBy>;
	action_duration?: Maybe<OrderBy>;
	action_processed?: Maybe<OrderBy>;
	case_id?: Maybe<OrderBy>;
	created_at?: Maybe<OrderBy>;
	guild?: Maybe<OrderBy>;
	id?: Maybe<OrderBy>;
	message?: Maybe<OrderBy>;
	mod_id?: Maybe<OrderBy>;
	mod_tag?: Maybe<OrderBy>;
	reason?: Maybe<OrderBy>;
	ref_id?: Maybe<OrderBy>;
	target_id?: Maybe<OrderBy>;
	target_tag?: Maybe<OrderBy>;
}

/** select columns of table "cases" */
export enum CasesSelectColumn {
	/** column name */
	Action = 'action',
	/** column name */
	ActionDuration = 'action_duration',
	/** column name */
	ActionProcessed = 'action_processed',
	/** column name */
	CaseId = 'case_id',
	/** column name */
	CreatedAt = 'created_at',
	/** column name */
	Guild = 'guild',
	/** column name */
	Id = 'id',
	/** column name */
	Message = 'message',
	/** column name */
	ModId = 'mod_id',
	/** column name */
	ModTag = 'mod_tag',
	/** column name */
	Reason = 'reason',
	/** column name */
	RefId = 'ref_id',
	/** column name */
	TargetId = 'target_id',
	/** column name */
	TargetTag = 'target_tag',
}

/** input type for updating data in table "cases" */
export interface CasesSetInput {
	action?: Maybe<Scalars['Int']>;
	action_duration?: Maybe<Scalars['timestamptz']>;
	action_processed?: Maybe<Scalars['Boolean']>;
	case_id?: Maybe<Scalars['Int']>;
	created_at?: Maybe<Scalars['timestamptz']>;
	guild?: Maybe<Scalars['String']>;
	id?: Maybe<Scalars['uuid']>;
	message?: Maybe<Scalars['String']>;
	mod_id?: Maybe<Scalars['String']>;
	mod_tag?: Maybe<Scalars['String']>;
	reason?: Maybe<Scalars['String']>;
	ref_id?: Maybe<Scalars['Int']>;
	target_id?: Maybe<Scalars['String']>;
	target_tag?: Maybe<Scalars['String']>;
}

/** aggregate stddev on columns */
export interface CasesStddevFields {
	action?: Maybe<Scalars['Float']>;
	case_id?: Maybe<Scalars['Float']>;
	ref_id?: Maybe<Scalars['Float']>;
}

/** order by stddev() on columns of table "cases" */
export interface CasesStddevOrderBy {
	action?: Maybe<OrderBy>;
	case_id?: Maybe<OrderBy>;
	ref_id?: Maybe<OrderBy>;
}

/** aggregate stddev_pop on columns */
export interface CasesStddevPopFields {
	action?: Maybe<Scalars['Float']>;
	case_id?: Maybe<Scalars['Float']>;
	ref_id?: Maybe<Scalars['Float']>;
}

/** order by stddev_pop() on columns of table "cases" */
export interface CasesStddevPopOrderBy {
	action?: Maybe<OrderBy>;
	case_id?: Maybe<OrderBy>;
	ref_id?: Maybe<OrderBy>;
}

/** aggregate stddev_samp on columns */
export interface CasesStddevSampFields {
	action?: Maybe<Scalars['Float']>;
	case_id?: Maybe<Scalars['Float']>;
	ref_id?: Maybe<Scalars['Float']>;
}

/** order by stddev_samp() on columns of table "cases" */
export interface CasesStddevSampOrderBy {
	action?: Maybe<OrderBy>;
	case_id?: Maybe<OrderBy>;
	ref_id?: Maybe<OrderBy>;
}

/** aggregate sum on columns */
export interface CasesSumFields {
	action?: Maybe<Scalars['Int']>;
	case_id?: Maybe<Scalars['Int']>;
	ref_id?: Maybe<Scalars['Int']>;
}

/** order by sum() on columns of table "cases" */
export interface CasesSumOrderBy {
	action?: Maybe<OrderBy>;
	case_id?: Maybe<OrderBy>;
	ref_id?: Maybe<OrderBy>;
}

/** update columns of table "cases" */
export enum CasesUpdateColumn {
	/** column name */
	Action = 'action',
	/** column name */
	ActionDuration = 'action_duration',
	/** column name */
	ActionProcessed = 'action_processed',
	/** column name */
	CaseId = 'case_id',
	/** column name */
	CreatedAt = 'created_at',
	/** column name */
	Guild = 'guild',
	/** column name */
	Id = 'id',
	/** column name */
	Message = 'message',
	/** column name */
	ModId = 'mod_id',
	/** column name */
	ModTag = 'mod_tag',
	/** column name */
	Reason = 'reason',
	/** column name */
	RefId = 'ref_id',
	/** column name */
	TargetId = 'target_id',
	/** column name */
	TargetTag = 'target_tag',
}

/** aggregate var_pop on columns */
export interface CasesVarPopFields {
	action?: Maybe<Scalars['Float']>;
	case_id?: Maybe<Scalars['Float']>;
	ref_id?: Maybe<Scalars['Float']>;
}

/** order by var_pop() on columns of table "cases" */
export interface CasesVarPopOrderBy {
	action?: Maybe<OrderBy>;
	case_id?: Maybe<OrderBy>;
	ref_id?: Maybe<OrderBy>;
}

/** aggregate var_samp on columns */
export interface CasesVarSampFields {
	action?: Maybe<Scalars['Float']>;
	case_id?: Maybe<Scalars['Float']>;
	ref_id?: Maybe<Scalars['Float']>;
}

/** order by var_samp() on columns of table "cases" */
export interface CasesVarSampOrderBy {
	action?: Maybe<OrderBy>;
	case_id?: Maybe<OrderBy>;
	ref_id?: Maybe<OrderBy>;
}

/** aggregate variance on columns */
export interface CasesVarianceFields {
	action?: Maybe<Scalars['Float']>;
	case_id?: Maybe<Scalars['Float']>;
	ref_id?: Maybe<Scalars['Float']>;
}

/** order by variance() on columns of table "cases" */
export interface CasesVarianceOrderBy {
	action?: Maybe<OrderBy>;
	case_id?: Maybe<OrderBy>;
	ref_id?: Maybe<OrderBy>;
}

/** conflict action */
export enum ConflictAction {
	/** ignore the insert on this row */
	Ignore = 'ignore',
	/** update the row with the given values */
	Update = 'update',
}

/** expression to compare columns of type Int. All fields are combined with logical 'AND'. */
export interface IntComparisonExp {
	_eq?: Maybe<Scalars['Int']>;
	_gt?: Maybe<Scalars['Int']>;
	_gte?: Maybe<Scalars['Int']>;
	_in?: Maybe<Array<Scalars['Int']>>;
	_is_null?: Maybe<Scalars['Boolean']>;
	_lt?: Maybe<Scalars['Int']>;
	_lte?: Maybe<Scalars['Int']>;
	_neq?: Maybe<Scalars['Int']>;
	_nin?: Maybe<Array<Scalars['Int']>>;
}

/** expression to compare columns of type jsonb. All fields are combined with logical 'AND'. */
export interface JsonbComparisonExp {
	/** is the column contained in the given json value */
	_contained_in?: Maybe<Scalars['jsonb']>;
	/** does the column contain the given json value at the top level */
	_contains?: Maybe<Scalars['jsonb']>;
	_eq?: Maybe<Scalars['jsonb']>;
	_gt?: Maybe<Scalars['jsonb']>;
	_gte?: Maybe<Scalars['jsonb']>;
	/** does the string exist as a top-level key in the column */
	_has_key?: Maybe<Scalars['String']>;
	/** do all of these strings exist as top-level keys in the column */
	_has_keys_all?: Maybe<Array<Scalars['String']>>;
	/** do any of these strings exist as top-level keys in the column */
	_has_keys_any?: Maybe<Array<Scalars['String']>>;
	_in?: Maybe<Array<Scalars['jsonb']>>;
	_is_null?: Maybe<Scalars['Boolean']>;
	_lt?: Maybe<Scalars['jsonb']>;
	_lte?: Maybe<Scalars['jsonb']>;
	_neq?: Maybe<Scalars['jsonb']>;
	_nin?: Maybe<Array<Scalars['jsonb']>>;
}

/** mutation root */
export interface MutationRoot {
	/** delete data from the table: "cases" */
	delete_cases?: Maybe<CasesMutationResponse>;
	/** delete data from the table: "role_states" */
	delete_role_states?: Maybe<RoleStatesMutationResponse>;
	/** delete data from the table: "settings" */
	delete_settings?: Maybe<SettingsMutationResponse>;
	/** delete data from the table: "staging.cases" */
	delete_staging_cases?: Maybe<StagingCasesMutationResponse>;
	/** delete data from the table: "staging.role_states" */
	delete_staging_role_states?: Maybe<StagingRoleStatesMutationResponse>;
	/** delete data from the table: "staging.settings" */
	delete_staging_settings?: Maybe<StagingSettingsMutationResponse>;
	/** delete data from the table: "staging.tags" */
	delete_staging_tags?: Maybe<StagingTagsMutationResponse>;
	/** delete data from the table: "tags" */
	delete_tags?: Maybe<TagsMutationResponse>;
	/** insert data into the table: "cases" */
	insert_cases?: Maybe<CasesMutationResponse>;
	/** insert data into the table: "role_states" */
	insert_role_states?: Maybe<RoleStatesMutationResponse>;
	/** insert data into the table: "settings" */
	insert_settings?: Maybe<SettingsMutationResponse>;
	/** insert data into the table: "staging.cases" */
	insert_staging_cases?: Maybe<StagingCasesMutationResponse>;
	/** insert data into the table: "staging.role_states" */
	insert_staging_role_states?: Maybe<StagingRoleStatesMutationResponse>;
	/** insert data into the table: "staging.settings" */
	insert_staging_settings?: Maybe<StagingSettingsMutationResponse>;
	/** insert data into the table: "staging.tags" */
	insert_staging_tags?: Maybe<StagingTagsMutationResponse>;
	/** insert data into the table: "tags" */
	insert_tags?: Maybe<TagsMutationResponse>;
	/** update data of the table: "cases" */
	update_cases?: Maybe<CasesMutationResponse>;
	/** update data of the table: "role_states" */
	update_role_states?: Maybe<RoleStatesMutationResponse>;
	/** update data of the table: "settings" */
	update_settings?: Maybe<SettingsMutationResponse>;
	/** update data of the table: "staging.cases" */
	update_staging_cases?: Maybe<StagingCasesMutationResponse>;
	/** update data of the table: "staging.role_states" */
	update_staging_role_states?: Maybe<StagingRoleStatesMutationResponse>;
	/** update data of the table: "staging.settings" */
	update_staging_settings?: Maybe<StagingSettingsMutationResponse>;
	/** update data of the table: "staging.tags" */
	update_staging_tags?: Maybe<StagingTagsMutationResponse>;
	/** update data of the table: "tags" */
	update_tags?: Maybe<TagsMutationResponse>;
}

/** mutation root */
export interface MutationRootDeleteCasesArgs {
	where: CasesBoolExp;
}

/** mutation root */
export interface MutationRootDeleteRoleStatesArgs {
	where: RoleStatesBoolExp;
}

/** mutation root */
export interface MutationRootDeleteSettingsArgs {
	where: SettingsBoolExp;
}

/** mutation root */
export interface MutationRootDeleteStagingCasesArgs {
	where: StagingCasesBoolExp;
}

/** mutation root */
export interface MutationRootDeleteStagingRoleStatesArgs {
	where: StagingRoleStatesBoolExp;
}

/** mutation root */
export interface MutationRootDeleteStagingSettingsArgs {
	where: StagingSettingsBoolExp;
}

/** mutation root */
export interface MutationRootDeleteStagingTagsArgs {
	where: StagingTagsBoolExp;
}

/** mutation root */
export interface MutationRootDeleteTagsArgs {
	where: TagsBoolExp;
}

/** mutation root */
export interface MutationRootInsertCasesArgs {
	objects: Array<CasesInsertInput>;
	on_conflict?: Maybe<CasesOnConflict>;
}

/** mutation root */
export interface MutationRootInsertRoleStatesArgs {
	objects: Array<RoleStatesInsertInput>;
	on_conflict?: Maybe<RoleStatesOnConflict>;
}

/** mutation root */
export interface MutationRootInsertSettingsArgs {
	objects: Array<SettingsInsertInput>;
	on_conflict?: Maybe<SettingsOnConflict>;
}

/** mutation root */
export interface MutationRootInsertStagingCasesArgs {
	objects: Array<StagingCasesInsertInput>;
	on_conflict?: Maybe<StagingCasesOnConflict>;
}

/** mutation root */
export interface MutationRootInsertStagingRoleStatesArgs {
	objects: Array<StagingRoleStatesInsertInput>;
	on_conflict?: Maybe<StagingRoleStatesOnConflict>;
}

/** mutation root */
export interface MutationRootInsertStagingSettingsArgs {
	objects: Array<StagingSettingsInsertInput>;
	on_conflict?: Maybe<StagingSettingsOnConflict>;
}

/** mutation root */
export interface MutationRootInsertStagingTagsArgs {
	objects: Array<StagingTagsInsertInput>;
	on_conflict?: Maybe<StagingTagsOnConflict>;
}

/** mutation root */
export interface MutationRootInsertTagsArgs {
	objects: Array<TagsInsertInput>;
	on_conflict?: Maybe<TagsOnConflict>;
}

/** mutation root */
export interface MutationRootUpdateCasesArgs {
	_inc?: Maybe<CasesIncInput>;
	_set?: Maybe<CasesSetInput>;
	where: CasesBoolExp;
}

/** mutation root */
export interface MutationRootUpdateRoleStatesArgs {
	_set?: Maybe<RoleStatesSetInput>;
	where: RoleStatesBoolExp;
}

/** mutation root */
export interface MutationRootUpdateSettingsArgs {
	_append?: Maybe<SettingsAppendInput>;
	_delete_at_path?: Maybe<SettingsDeleteAtPathInput>;
	_delete_elem?: Maybe<SettingsDeleteElemInput>;
	_delete_key?: Maybe<SettingsDeleteKeyInput>;
	_prepend?: Maybe<SettingsPrependInput>;
	_set?: Maybe<SettingsSetInput>;
	where: SettingsBoolExp;
}

/** mutation root */
export interface MutationRootUpdateStagingCasesArgs {
	_inc?: Maybe<StagingCasesIncInput>;
	_set?: Maybe<StagingCasesSetInput>;
	where: StagingCasesBoolExp;
}

/** mutation root */
export interface MutationRootUpdateStagingRoleStatesArgs {
	_set?: Maybe<StagingRoleStatesSetInput>;
	where: StagingRoleStatesBoolExp;
}

/** mutation root */
export interface MutationRootUpdateStagingSettingsArgs {
	_append?: Maybe<StagingSettingsAppendInput>;
	_delete_at_path?: Maybe<StagingSettingsDeleteAtPathInput>;
	_delete_elem?: Maybe<StagingSettingsDeleteElemInput>;
	_delete_key?: Maybe<StagingSettingsDeleteKeyInput>;
	_prepend?: Maybe<StagingSettingsPrependInput>;
	_set?: Maybe<StagingSettingsSetInput>;
	where: StagingSettingsBoolExp;
}

/** mutation root */
export interface MutationRootUpdateStagingTagsArgs {
	_inc?: Maybe<StagingTagsIncInput>;
	_set?: Maybe<StagingTagsSetInput>;
	where: StagingTagsBoolExp;
}

/** mutation root */
export interface MutationRootUpdateTagsArgs {
	_inc?: Maybe<TagsIncInput>;
	_set?: Maybe<TagsSetInput>;
	where: TagsBoolExp;
}

/** column ordering options */
export enum OrderBy {
	/** in the ascending order, nulls last */
	Asc = 'asc',
	/** in the ascending order, nulls first */
	AscNullsFirst = 'asc_nulls_first',
	/** in the ascending order, nulls last */
	AscNullsLast = 'asc_nulls_last',
	/** in the descending order, nulls first */
	Desc = 'desc',
	/** in the descending order, nulls first */
	DescNullsFirst = 'desc_nulls_first',
	/** in the descending order, nulls last */
	DescNullsLast = 'desc_nulls_last',
}

/** query root */
export interface QueryRoot {
	/** fetch data from the table: "cases" */
	cases: Array<Cases>;
	/** fetch aggregated fields from the table: "cases" */
	cases_aggregate: CasesAggregate;
	/** fetch data from the table: "cases" using primary key columns */
	cases_by_pk?: Maybe<Cases>;
	/** fetch data from the table: "role_states" */
	role_states: Array<RoleStates>;
	/** fetch aggregated fields from the table: "role_states" */
	role_states_aggregate: RoleStatesAggregate;
	/** fetch data from the table: "role_states" using primary key columns */
	role_states_by_pk?: Maybe<RoleStates>;
	/** fetch data from the table: "settings" */
	settings: Array<Settings>;
	/** fetch aggregated fields from the table: "settings" */
	settings_aggregate: SettingsAggregate;
	/** fetch data from the table: "settings" using primary key columns */
	settings_by_pk?: Maybe<Settings>;
	/** fetch data from the table: "staging.cases" */
	staging_cases: Array<StagingCases>;
	/** fetch aggregated fields from the table: "staging.cases" */
	staging_cases_aggregate: StagingCasesAggregate;
	/** fetch data from the table: "staging.cases" using primary key columns */
	staging_cases_by_pk?: Maybe<StagingCases>;
	/** fetch data from the table: "staging.role_states" */
	staging_role_states: Array<StagingRoleStates>;
	/** fetch aggregated fields from the table: "staging.role_states" */
	staging_role_states_aggregate: StagingRoleStatesAggregate;
	/** fetch data from the table: "staging.role_states" using primary key columns */
	staging_role_states_by_pk?: Maybe<StagingRoleStates>;
	/** fetch data from the table: "staging.settings" */
	staging_settings: Array<StagingSettings>;
	/** fetch aggregated fields from the table: "staging.settings" */
	staging_settings_aggregate: StagingSettingsAggregate;
	/** fetch data from the table: "staging.settings" using primary key columns */
	staging_settings_by_pk?: Maybe<StagingSettings>;
	/** fetch data from the table: "staging.tags" */
	staging_tags: Array<StagingTags>;
	/** fetch aggregated fields from the table: "staging.tags" */
	staging_tags_aggregate: StagingTagsAggregate;
	/** fetch data from the table: "staging.tags" using primary key columns */
	staging_tags_by_pk?: Maybe<StagingTags>;
	/** fetch data from the table: "tags" */
	tags: Array<Tags>;
	/** fetch aggregated fields from the table: "tags" */
	tags_aggregate: TagsAggregate;
	/** fetch data from the table: "tags" using primary key columns */
	tags_by_pk?: Maybe<Tags>;
}

/** query root */
export interface QueryRootCasesArgs {
	distinct_on?: Maybe<Array<CasesSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<CasesOrderBy>>;
	where?: Maybe<CasesBoolExp>;
}

/** query root */
export interface QueryRootCasesAggregateArgs {
	distinct_on?: Maybe<Array<CasesSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<CasesOrderBy>>;
	where?: Maybe<CasesBoolExp>;
}

/** query root */
export interface QueryRootCasesByPkArgs {
	id: Scalars['uuid'];
}

/** query root */
export interface QueryRootRoleStatesArgs {
	distinct_on?: Maybe<Array<RoleStatesSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<RoleStatesOrderBy>>;
	where?: Maybe<RoleStatesBoolExp>;
}

/** query root */
export interface QueryRootRoleStatesAggregateArgs {
	distinct_on?: Maybe<Array<RoleStatesSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<RoleStatesOrderBy>>;
	where?: Maybe<RoleStatesBoolExp>;
}

/** query root */
export interface QueryRootRoleStatesByPkArgs {
	id: Scalars['uuid'];
}

/** query root */
export interface QueryRootSettingsArgs {
	distinct_on?: Maybe<Array<SettingsSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<SettingsOrderBy>>;
	where?: Maybe<SettingsBoolExp>;
}

/** query root */
export interface QueryRootSettingsAggregateArgs {
	distinct_on?: Maybe<Array<SettingsSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<SettingsOrderBy>>;
	where?: Maybe<SettingsBoolExp>;
}

/** query root */
export interface QueryRootSettingsByPkArgs {
	guild: Scalars['String'];
}

/** query root */
export interface QueryRootStagingCasesArgs {
	distinct_on?: Maybe<Array<StagingCasesSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<StagingCasesOrderBy>>;
	where?: Maybe<StagingCasesBoolExp>;
}

/** query root */
export interface QueryRootStagingCasesAggregateArgs {
	distinct_on?: Maybe<Array<StagingCasesSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<StagingCasesOrderBy>>;
	where?: Maybe<StagingCasesBoolExp>;
}

/** query root */
export interface QueryRootStagingCasesByPkArgs {
	id: Scalars['uuid'];
}

/** query root */
export interface QueryRootStagingRoleStatesArgs {
	distinct_on?: Maybe<Array<StagingRoleStatesSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<StagingRoleStatesOrderBy>>;
	where?: Maybe<StagingRoleStatesBoolExp>;
}

/** query root */
export interface QueryRootStagingRoleStatesAggregateArgs {
	distinct_on?: Maybe<Array<StagingRoleStatesSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<StagingRoleStatesOrderBy>>;
	where?: Maybe<StagingRoleStatesBoolExp>;
}

/** query root */
export interface QueryRootStagingRoleStatesByPkArgs {
	id: Scalars['uuid'];
}

/** query root */
export interface QueryRootStagingSettingsArgs {
	distinct_on?: Maybe<Array<StagingSettingsSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<StagingSettingsOrderBy>>;
	where?: Maybe<StagingSettingsBoolExp>;
}

/** query root */
export interface QueryRootStagingSettingsAggregateArgs {
	distinct_on?: Maybe<Array<StagingSettingsSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<StagingSettingsOrderBy>>;
	where?: Maybe<StagingSettingsBoolExp>;
}

/** query root */
export interface QueryRootStagingSettingsByPkArgs {
	guild: Scalars['String'];
}

/** query root */
export interface QueryRootStagingTagsArgs {
	distinct_on?: Maybe<Array<StagingTagsSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<StagingTagsOrderBy>>;
	where?: Maybe<StagingTagsBoolExp>;
}

/** query root */
export interface QueryRootStagingTagsAggregateArgs {
	distinct_on?: Maybe<Array<StagingTagsSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<StagingTagsOrderBy>>;
	where?: Maybe<StagingTagsBoolExp>;
}

/** query root */
export interface QueryRootStagingTagsByPkArgs {
	id: Scalars['uuid'];
}

/** query root */
export interface QueryRootTagsArgs {
	distinct_on?: Maybe<Array<TagsSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<TagsOrderBy>>;
	where?: Maybe<TagsBoolExp>;
}

/** query root */
export interface QueryRootTagsAggregateArgs {
	distinct_on?: Maybe<Array<TagsSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<TagsOrderBy>>;
	where?: Maybe<TagsBoolExp>;
}

/** query root */
export interface QueryRootTagsByPkArgs {
	id: Scalars['uuid'];
}

/** columns and relationships of "role_states" */
export interface RoleStates {
	guild: Scalars['String'];
	id: Scalars['uuid'];
	member: Scalars['String'];
	roles: Scalars['_text'];
}

/** aggregated selection of "role_states" */
export interface RoleStatesAggregate {
	aggregate?: Maybe<RoleStatesAggregateFields>;
	nodes: Array<RoleStates>;
}

/** aggregate fields of "role_states" */
export interface RoleStatesAggregateFields {
	count?: Maybe<Scalars['Int']>;
	max?: Maybe<RoleStatesMaxFields>;
	min?: Maybe<RoleStatesMinFields>;
}

/** aggregate fields of "role_states" */
export interface RoleStatesAggregateFieldsCountArgs {
	columns?: Maybe<Array<RoleStatesSelectColumn>>;
	distinct?: Maybe<Scalars['Boolean']>;
}

/** order by aggregate values of table "role_states" */
export interface RoleStatesAggregateOrderBy {
	count?: Maybe<OrderBy>;
	max?: Maybe<RoleStatesMaxOrderBy>;
	min?: Maybe<RoleStatesMinOrderBy>;
}

/** input type for inserting array relation for remote table "role_states" */
export interface RoleStatesArrRelInsertInput {
	data: Array<RoleStatesInsertInput>;
	on_conflict?: Maybe<RoleStatesOnConflict>;
}

/** Boolean expression to filter rows from the table "role_states". All fields are combined with a logical 'AND'. */
export interface RoleStatesBoolExp {
	_and?: Maybe<Array<Maybe<RoleStatesBoolExp>>>;
	_not?: Maybe<RoleStatesBoolExp>;
	_or?: Maybe<Array<Maybe<RoleStatesBoolExp>>>;
	guild?: Maybe<StringComparisonExp>;
	id?: Maybe<UuidComparisonExp>;
	member?: Maybe<StringComparisonExp>;
	roles?: Maybe<TextComparisonExp>;
}

/** unique or primary key constraints on table "role_states" */
export enum RoleStatesConstraint {
	/** unique or primary key constraint */
	RoleStatesGuildMemberKey = 'role_states_guild_member_key',
	/** unique or primary key constraint */
	RoleStatesPkey = 'role_states_pkey',
}

/** input type for inserting data into table "role_states" */
export interface RoleStatesInsertInput {
	guild?: Maybe<Scalars['String']>;
	id?: Maybe<Scalars['uuid']>;
	member?: Maybe<Scalars['String']>;
	roles?: Maybe<Scalars['_text']>;
}

/** aggregate max on columns */
export interface RoleStatesMaxFields {
	guild?: Maybe<Scalars['String']>;
	member?: Maybe<Scalars['String']>;
}

/** order by max() on columns of table "role_states" */
export interface RoleStatesMaxOrderBy {
	guild?: Maybe<OrderBy>;
	member?: Maybe<OrderBy>;
}

/** aggregate min on columns */
export interface RoleStatesMinFields {
	guild?: Maybe<Scalars['String']>;
	member?: Maybe<Scalars['String']>;
}

/** order by min() on columns of table "role_states" */
export interface RoleStatesMinOrderBy {
	guild?: Maybe<OrderBy>;
	member?: Maybe<OrderBy>;
}

/** response of any mutation on the table "role_states" */
export interface RoleStatesMutationResponse {
	/** number of affected rows by the mutation */
	affected_rows: Scalars['Int'];
	/** data of the affected rows by the mutation */
	returning: Array<RoleStates>;
}

/** input type for inserting object relation for remote table "role_states" */
export interface RoleStatesObjRelInsertInput {
	data: RoleStatesInsertInput;
	on_conflict?: Maybe<RoleStatesOnConflict>;
}

/** on conflict condition type for table "role_states" */
export interface RoleStatesOnConflict {
	constraint: RoleStatesConstraint;
	update_columns: Array<RoleStatesUpdateColumn>;
}

/** ordering options when selecting data from "role_states" */
export interface RoleStatesOrderBy {
	guild?: Maybe<OrderBy>;
	id?: Maybe<OrderBy>;
	member?: Maybe<OrderBy>;
	roles?: Maybe<OrderBy>;
}

/** select columns of table "role_states" */
export enum RoleStatesSelectColumn {
	/** column name */
	Guild = 'guild',
	/** column name */
	Id = 'id',
	/** column name */
	Member = 'member',
	/** column name */
	Roles = 'roles',
}

/** input type for updating data in table "role_states" */
export interface RoleStatesSetInput {
	guild?: Maybe<Scalars['String']>;
	id?: Maybe<Scalars['uuid']>;
	member?: Maybe<Scalars['String']>;
	roles?: Maybe<Scalars['_text']>;
}

/** update columns of table "role_states" */
export enum RoleStatesUpdateColumn {
	/** column name */
	Guild = 'guild',
	/** column name */
	Id = 'id',
	/** column name */
	Member = 'member',
	/** column name */
	Roles = 'roles',
}

/** columns and relationships of "settings" */
export interface Settings {
	guild: Scalars['String'];
	settings: Scalars['jsonb'];
}

/** columns and relationships of "settings" */
export interface SettingsSettingsArgs {
	path?: Maybe<Scalars['String']>;
}

/** aggregated selection of "settings" */
export interface SettingsAggregate {
	aggregate?: Maybe<SettingsAggregateFields>;
	nodes: Array<Settings>;
}

/** aggregate fields of "settings" */
export interface SettingsAggregateFields {
	count?: Maybe<Scalars['Int']>;
	max?: Maybe<SettingsMaxFields>;
	min?: Maybe<SettingsMinFields>;
}

/** aggregate fields of "settings" */
export interface SettingsAggregateFieldsCountArgs {
	columns?: Maybe<Array<SettingsSelectColumn>>;
	distinct?: Maybe<Scalars['Boolean']>;
}

/** order by aggregate values of table "settings" */
export interface SettingsAggregateOrderBy {
	count?: Maybe<OrderBy>;
	max?: Maybe<SettingsMaxOrderBy>;
	min?: Maybe<SettingsMinOrderBy>;
}

/** append existing jsonb value of filtered columns with new jsonb value */
export interface SettingsAppendInput {
	settings?: Maybe<Scalars['jsonb']>;
}

/** input type for inserting array relation for remote table "settings" */
export interface SettingsArrRelInsertInput {
	data: Array<SettingsInsertInput>;
	on_conflict?: Maybe<SettingsOnConflict>;
}

/** Boolean expression to filter rows from the table "settings". All fields are combined with a logical 'AND'. */
export interface SettingsBoolExp {
	_and?: Maybe<Array<Maybe<SettingsBoolExp>>>;
	_not?: Maybe<SettingsBoolExp>;
	_or?: Maybe<Array<Maybe<SettingsBoolExp>>>;
	guild?: Maybe<StringComparisonExp>;
	settings?: Maybe<JsonbComparisonExp>;
}

/** unique or primary key constraints on table "settings" */
export enum SettingsConstraint {
	/** unique or primary key constraint */
	SettingsPkey = 'settings_pkey',
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export interface SettingsDeleteAtPathInput {
	settings?: Maybe<Array<Maybe<Scalars['String']>>>;
}

/**
 * delete the array element with specified index (negative integers count from the
 * end). throws an error if top level container is not an array
 **/
export interface SettingsDeleteElemInput {
	settings?: Maybe<Scalars['Int']>;
}

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export interface SettingsDeleteKeyInput {
	settings?: Maybe<Scalars['String']>;
}

/** input type for inserting data into table "settings" */
export interface SettingsInsertInput {
	guild?: Maybe<Scalars['String']>;
	settings?: Maybe<Scalars['jsonb']>;
}

/** aggregate max on columns */
export interface SettingsMaxFields {
	guild?: Maybe<Scalars['String']>;
}

/** order by max() on columns of table "settings" */
export interface SettingsMaxOrderBy {
	guild?: Maybe<OrderBy>;
}

/** aggregate min on columns */
export interface SettingsMinFields {
	guild?: Maybe<Scalars['String']>;
}

/** order by min() on columns of table "settings" */
export interface SettingsMinOrderBy {
	guild?: Maybe<OrderBy>;
}

/** response of any mutation on the table "settings" */
export interface SettingsMutationResponse {
	/** number of affected rows by the mutation */
	affected_rows: Scalars['Int'];
	/** data of the affected rows by the mutation */
	returning: Array<Settings>;
}

/** input type for inserting object relation for remote table "settings" */
export interface SettingsObjRelInsertInput {
	data: SettingsInsertInput;
	on_conflict?: Maybe<SettingsOnConflict>;
}

/** on conflict condition type for table "settings" */
export interface SettingsOnConflict {
	constraint: SettingsConstraint;
	update_columns: Array<SettingsUpdateColumn>;
}

/** ordering options when selecting data from "settings" */
export interface SettingsOrderBy {
	guild?: Maybe<OrderBy>;
	settings?: Maybe<OrderBy>;
}

/** prepend existing jsonb value of filtered columns with new jsonb value */
export interface SettingsPrependInput {
	settings?: Maybe<Scalars['jsonb']>;
}

/** select columns of table "settings" */
export enum SettingsSelectColumn {
	/** column name */
	Guild = 'guild',
	/** column name */
	Settings = 'settings',
}

/** input type for updating data in table "settings" */
export interface SettingsSetInput {
	guild?: Maybe<Scalars['String']>;
	settings?: Maybe<Scalars['jsonb']>;
}

/** update columns of table "settings" */
export enum SettingsUpdateColumn {
	/** column name */
	Guild = 'guild',
	/** column name */
	Settings = 'settings',
}

/** columns and relationships of "staging.cases" */
export interface StagingCases {
	action: Scalars['Int'];
	action_duration?: Maybe<Scalars['timestamptz']>;
	action_processed?: Maybe<Scalars['Boolean']>;
	case_id: Scalars['Int'];
	created_at: Scalars['timestamptz'];
	guild: Scalars['String'];
	id: Scalars['uuid'];
	message?: Maybe<Scalars['String']>;
	mod_id?: Maybe<Scalars['String']>;
	mod_tag?: Maybe<Scalars['String']>;
	reason?: Maybe<Scalars['String']>;
	ref_id?: Maybe<Scalars['Int']>;
	target_id: Scalars['String'];
	target_tag: Scalars['String'];
}

/** aggregated selection of "staging.cases" */
export interface StagingCasesAggregate {
	aggregate?: Maybe<StagingCasesAggregateFields>;
	nodes: Array<StagingCases>;
}

/** aggregate fields of "staging.cases" */
export interface StagingCasesAggregateFields {
	avg?: Maybe<StagingCasesAvgFields>;
	count?: Maybe<Scalars['Int']>;
	max?: Maybe<StagingCasesMaxFields>;
	min?: Maybe<StagingCasesMinFields>;
	stddev?: Maybe<StagingCasesStddevFields>;
	stddev_pop?: Maybe<StagingCasesStddevPopFields>;
	stddev_samp?: Maybe<StagingCasesStddevSampFields>;
	sum?: Maybe<StagingCasesSumFields>;
	var_pop?: Maybe<StagingCasesVarPopFields>;
	var_samp?: Maybe<StagingCasesVarSampFields>;
	variance?: Maybe<StagingCasesVarianceFields>;
}

/** aggregate fields of "staging.cases" */
export interface StagingCasesAggregateFieldsCountArgs {
	columns?: Maybe<Array<StagingCasesSelectColumn>>;
	distinct?: Maybe<Scalars['Boolean']>;
}

/** order by aggregate values of table "staging.cases" */
export interface StagingCasesAggregateOrderBy {
	avg?: Maybe<StagingCasesAvgOrderBy>;
	count?: Maybe<OrderBy>;
	max?: Maybe<StagingCasesMaxOrderBy>;
	min?: Maybe<StagingCasesMinOrderBy>;
	stddev?: Maybe<StagingCasesStddevOrderBy>;
	stddev_pop?: Maybe<StagingCasesStddevPopOrderBy>;
	stddev_samp?: Maybe<StagingCasesStddevSampOrderBy>;
	sum?: Maybe<StagingCasesSumOrderBy>;
	var_pop?: Maybe<StagingCasesVarPopOrderBy>;
	var_samp?: Maybe<StagingCasesVarSampOrderBy>;
	variance?: Maybe<StagingCasesVarianceOrderBy>;
}

/** input type for inserting array relation for remote table "staging.cases" */
export interface StagingCasesArrRelInsertInput {
	data: Array<StagingCasesInsertInput>;
	on_conflict?: Maybe<StagingCasesOnConflict>;
}

/** aggregate avg on columns */
export interface StagingCasesAvgFields {
	action?: Maybe<Scalars['Float']>;
	case_id?: Maybe<Scalars['Float']>;
	ref_id?: Maybe<Scalars['Float']>;
}

/** order by avg() on columns of table "staging.cases" */
export interface StagingCasesAvgOrderBy {
	action?: Maybe<OrderBy>;
	case_id?: Maybe<OrderBy>;
	ref_id?: Maybe<OrderBy>;
}

/** Boolean expression to filter rows from the table "staging.cases". All fields are combined with a logical 'AND'. */
export interface StagingCasesBoolExp {
	_and?: Maybe<Array<Maybe<StagingCasesBoolExp>>>;
	_not?: Maybe<StagingCasesBoolExp>;
	_or?: Maybe<Array<Maybe<StagingCasesBoolExp>>>;
	action?: Maybe<IntComparisonExp>;
	action_duration?: Maybe<TimestamptzComparisonExp>;
	action_processed?: Maybe<BooleanComparisonExp>;
	case_id?: Maybe<IntComparisonExp>;
	created_at?: Maybe<TimestamptzComparisonExp>;
	guild?: Maybe<StringComparisonExp>;
	id?: Maybe<UuidComparisonExp>;
	message?: Maybe<StringComparisonExp>;
	mod_id?: Maybe<StringComparisonExp>;
	mod_tag?: Maybe<StringComparisonExp>;
	reason?: Maybe<StringComparisonExp>;
	ref_id?: Maybe<IntComparisonExp>;
	target_id?: Maybe<StringComparisonExp>;
	target_tag?: Maybe<StringComparisonExp>;
}

/** unique or primary key constraints on table "staging.cases" */
export enum StagingCasesConstraint {
	/** unique or primary key constraint */
	CasesPkey = 'cases_pkey',
}

/** input type for incrementing integer columne in table "staging.cases" */
export interface StagingCasesIncInput {
	action?: Maybe<Scalars['Int']>;
	case_id?: Maybe<Scalars['Int']>;
	ref_id?: Maybe<Scalars['Int']>;
}

/** input type for inserting data into table "staging.cases" */
export interface StagingCasesInsertInput {
	action?: Maybe<Scalars['Int']>;
	action_duration?: Maybe<Scalars['timestamptz']>;
	action_processed?: Maybe<Scalars['Boolean']>;
	case_id?: Maybe<Scalars['Int']>;
	created_at?: Maybe<Scalars['timestamptz']>;
	guild?: Maybe<Scalars['String']>;
	id?: Maybe<Scalars['uuid']>;
	message?: Maybe<Scalars['String']>;
	mod_id?: Maybe<Scalars['String']>;
	mod_tag?: Maybe<Scalars['String']>;
	reason?: Maybe<Scalars['String']>;
	ref_id?: Maybe<Scalars['Int']>;
	target_id?: Maybe<Scalars['String']>;
	target_tag?: Maybe<Scalars['String']>;
}

/** aggregate max on columns */
export interface StagingCasesMaxFields {
	action?: Maybe<Scalars['Int']>;
	action_duration?: Maybe<Scalars['timestamptz']>;
	case_id?: Maybe<Scalars['Int']>;
	created_at?: Maybe<Scalars['timestamptz']>;
	guild?: Maybe<Scalars['String']>;
	message?: Maybe<Scalars['String']>;
	mod_id?: Maybe<Scalars['String']>;
	mod_tag?: Maybe<Scalars['String']>;
	reason?: Maybe<Scalars['String']>;
	ref_id?: Maybe<Scalars['Int']>;
	target_id?: Maybe<Scalars['String']>;
	target_tag?: Maybe<Scalars['String']>;
}

/** order by max() on columns of table "staging.cases" */
export interface StagingCasesMaxOrderBy {
	action?: Maybe<OrderBy>;
	action_duration?: Maybe<OrderBy>;
	case_id?: Maybe<OrderBy>;
	created_at?: Maybe<OrderBy>;
	guild?: Maybe<OrderBy>;
	message?: Maybe<OrderBy>;
	mod_id?: Maybe<OrderBy>;
	mod_tag?: Maybe<OrderBy>;
	reason?: Maybe<OrderBy>;
	ref_id?: Maybe<OrderBy>;
	target_id?: Maybe<OrderBy>;
	target_tag?: Maybe<OrderBy>;
}

/** aggregate min on columns */
export interface StagingCasesMinFields {
	action?: Maybe<Scalars['Int']>;
	action_duration?: Maybe<Scalars['timestamptz']>;
	case_id?: Maybe<Scalars['Int']>;
	created_at?: Maybe<Scalars['timestamptz']>;
	guild?: Maybe<Scalars['String']>;
	message?: Maybe<Scalars['String']>;
	mod_id?: Maybe<Scalars['String']>;
	mod_tag?: Maybe<Scalars['String']>;
	reason?: Maybe<Scalars['String']>;
	ref_id?: Maybe<Scalars['Int']>;
	target_id?: Maybe<Scalars['String']>;
	target_tag?: Maybe<Scalars['String']>;
}

/** order by min() on columns of table "staging.cases" */
export interface StagingCasesMinOrderBy {
	action?: Maybe<OrderBy>;
	action_duration?: Maybe<OrderBy>;
	case_id?: Maybe<OrderBy>;
	created_at?: Maybe<OrderBy>;
	guild?: Maybe<OrderBy>;
	message?: Maybe<OrderBy>;
	mod_id?: Maybe<OrderBy>;
	mod_tag?: Maybe<OrderBy>;
	reason?: Maybe<OrderBy>;
	ref_id?: Maybe<OrderBy>;
	target_id?: Maybe<OrderBy>;
	target_tag?: Maybe<OrderBy>;
}

/** response of any mutation on the table "staging.cases" */
export interface StagingCasesMutationResponse {
	/** number of affected rows by the mutation */
	affected_rows: Scalars['Int'];
	/** data of the affected rows by the mutation */
	returning: Array<StagingCases>;
}

/** input type for inserting object relation for remote table "staging.cases" */
export interface StagingCasesObjRelInsertInput {
	data: StagingCasesInsertInput;
	on_conflict?: Maybe<StagingCasesOnConflict>;
}

/** on conflict condition type for table "staging.cases" */
export interface StagingCasesOnConflict {
	constraint: StagingCasesConstraint;
	update_columns: Array<StagingCasesUpdateColumn>;
}

/** ordering options when selecting data from "staging.cases" */
export interface StagingCasesOrderBy {
	action?: Maybe<OrderBy>;
	action_duration?: Maybe<OrderBy>;
	action_processed?: Maybe<OrderBy>;
	case_id?: Maybe<OrderBy>;
	created_at?: Maybe<OrderBy>;
	guild?: Maybe<OrderBy>;
	id?: Maybe<OrderBy>;
	message?: Maybe<OrderBy>;
	mod_id?: Maybe<OrderBy>;
	mod_tag?: Maybe<OrderBy>;
	reason?: Maybe<OrderBy>;
	ref_id?: Maybe<OrderBy>;
	target_id?: Maybe<OrderBy>;
	target_tag?: Maybe<OrderBy>;
}

/** select columns of table "staging.cases" */
export enum StagingCasesSelectColumn {
	/** column name */
	Action = 'action',
	/** column name */
	ActionDuration = 'action_duration',
	/** column name */
	ActionProcessed = 'action_processed',
	/** column name */
	CaseId = 'case_id',
	/** column name */
	CreatedAt = 'created_at',
	/** column name */
	Guild = 'guild',
	/** column name */
	Id = 'id',
	/** column name */
	Message = 'message',
	/** column name */
	ModId = 'mod_id',
	/** column name */
	ModTag = 'mod_tag',
	/** column name */
	Reason = 'reason',
	/** column name */
	RefId = 'ref_id',
	/** column name */
	TargetId = 'target_id',
	/** column name */
	TargetTag = 'target_tag',
}

/** input type for updating data in table "staging.cases" */
export interface StagingCasesSetInput {
	action?: Maybe<Scalars['Int']>;
	action_duration?: Maybe<Scalars['timestamptz']>;
	action_processed?: Maybe<Scalars['Boolean']>;
	case_id?: Maybe<Scalars['Int']>;
	created_at?: Maybe<Scalars['timestamptz']>;
	guild?: Maybe<Scalars['String']>;
	id?: Maybe<Scalars['uuid']>;
	message?: Maybe<Scalars['String']>;
	mod_id?: Maybe<Scalars['String']>;
	mod_tag?: Maybe<Scalars['String']>;
	reason?: Maybe<Scalars['String']>;
	ref_id?: Maybe<Scalars['Int']>;
	target_id?: Maybe<Scalars['String']>;
	target_tag?: Maybe<Scalars['String']>;
}

/** aggregate stddev on columns */
export interface StagingCasesStddevFields {
	action?: Maybe<Scalars['Float']>;
	case_id?: Maybe<Scalars['Float']>;
	ref_id?: Maybe<Scalars['Float']>;
}

/** order by stddev() on columns of table "staging.cases" */
export interface StagingCasesStddevOrderBy {
	action?: Maybe<OrderBy>;
	case_id?: Maybe<OrderBy>;
	ref_id?: Maybe<OrderBy>;
}

/** aggregate stddev_pop on columns */
export interface StagingCasesStddevPopFields {
	action?: Maybe<Scalars['Float']>;
	case_id?: Maybe<Scalars['Float']>;
	ref_id?: Maybe<Scalars['Float']>;
}

/** order by stddev_pop() on columns of table "staging.cases" */
export interface StagingCasesStddevPopOrderBy {
	action?: Maybe<OrderBy>;
	case_id?: Maybe<OrderBy>;
	ref_id?: Maybe<OrderBy>;
}

/** aggregate stddev_samp on columns */
export interface StagingCasesStddevSampFields {
	action?: Maybe<Scalars['Float']>;
	case_id?: Maybe<Scalars['Float']>;
	ref_id?: Maybe<Scalars['Float']>;
}

/** order by stddev_samp() on columns of table "staging.cases" */
export interface StagingCasesStddevSampOrderBy {
	action?: Maybe<OrderBy>;
	case_id?: Maybe<OrderBy>;
	ref_id?: Maybe<OrderBy>;
}

/** aggregate sum on columns */
export interface StagingCasesSumFields {
	action?: Maybe<Scalars['Int']>;
	case_id?: Maybe<Scalars['Int']>;
	ref_id?: Maybe<Scalars['Int']>;
}

/** order by sum() on columns of table "staging.cases" */
export interface StagingCasesSumOrderBy {
	action?: Maybe<OrderBy>;
	case_id?: Maybe<OrderBy>;
	ref_id?: Maybe<OrderBy>;
}

/** update columns of table "staging.cases" */
export enum StagingCasesUpdateColumn {
	/** column name */
	Action = 'action',
	/** column name */
	ActionDuration = 'action_duration',
	/** column name */
	ActionProcessed = 'action_processed',
	/** column name */
	CaseId = 'case_id',
	/** column name */
	CreatedAt = 'created_at',
	/** column name */
	Guild = 'guild',
	/** column name */
	Id = 'id',
	/** column name */
	Message = 'message',
	/** column name */
	ModId = 'mod_id',
	/** column name */
	ModTag = 'mod_tag',
	/** column name */
	Reason = 'reason',
	/** column name */
	RefId = 'ref_id',
	/** column name */
	TargetId = 'target_id',
	/** column name */
	TargetTag = 'target_tag',
}

/** aggregate var_pop on columns */
export interface StagingCasesVarPopFields {
	action?: Maybe<Scalars['Float']>;
	case_id?: Maybe<Scalars['Float']>;
	ref_id?: Maybe<Scalars['Float']>;
}

/** order by var_pop() on columns of table "staging.cases" */
export interface StagingCasesVarPopOrderBy {
	action?: Maybe<OrderBy>;
	case_id?: Maybe<OrderBy>;
	ref_id?: Maybe<OrderBy>;
}

/** aggregate var_samp on columns */
export interface StagingCasesVarSampFields {
	action?: Maybe<Scalars['Float']>;
	case_id?: Maybe<Scalars['Float']>;
	ref_id?: Maybe<Scalars['Float']>;
}

/** order by var_samp() on columns of table "staging.cases" */
export interface StagingCasesVarSampOrderBy {
	action?: Maybe<OrderBy>;
	case_id?: Maybe<OrderBy>;
	ref_id?: Maybe<OrderBy>;
}

/** aggregate variance on columns */
export interface StagingCasesVarianceFields {
	action?: Maybe<Scalars['Float']>;
	case_id?: Maybe<Scalars['Float']>;
	ref_id?: Maybe<Scalars['Float']>;
}

/** order by variance() on columns of table "staging.cases" */
export interface StagingCasesVarianceOrderBy {
	action?: Maybe<OrderBy>;
	case_id?: Maybe<OrderBy>;
	ref_id?: Maybe<OrderBy>;
}

/** columns and relationships of "staging.role_states" */
export interface StagingRoleStates {
	guild: Scalars['String'];
	id: Scalars['uuid'];
	member: Scalars['String'];
	roles: Scalars['_text'];
}

/** aggregated selection of "staging.role_states" */
export interface StagingRoleStatesAggregate {
	aggregate?: Maybe<StagingRoleStatesAggregateFields>;
	nodes: Array<StagingRoleStates>;
}

/** aggregate fields of "staging.role_states" */
export interface StagingRoleStatesAggregateFields {
	count?: Maybe<Scalars['Int']>;
	max?: Maybe<StagingRoleStatesMaxFields>;
	min?: Maybe<StagingRoleStatesMinFields>;
}

/** aggregate fields of "staging.role_states" */
export interface StagingRoleStatesAggregateFieldsCountArgs {
	columns?: Maybe<Array<StagingRoleStatesSelectColumn>>;
	distinct?: Maybe<Scalars['Boolean']>;
}

/** order by aggregate values of table "staging.role_states" */
export interface StagingRoleStatesAggregateOrderBy {
	count?: Maybe<OrderBy>;
	max?: Maybe<StagingRoleStatesMaxOrderBy>;
	min?: Maybe<StagingRoleStatesMinOrderBy>;
}

/** input type for inserting array relation for remote table "staging.role_states" */
export interface StagingRoleStatesArrRelInsertInput {
	data: Array<StagingRoleStatesInsertInput>;
	on_conflict?: Maybe<StagingRoleStatesOnConflict>;
}

/** Boolean expression to filter rows from the table "staging.role_states". All fields are combined with a logical 'AND'. */
export interface StagingRoleStatesBoolExp {
	_and?: Maybe<Array<Maybe<StagingRoleStatesBoolExp>>>;
	_not?: Maybe<StagingRoleStatesBoolExp>;
	_or?: Maybe<Array<Maybe<StagingRoleStatesBoolExp>>>;
	guild?: Maybe<StringComparisonExp>;
	id?: Maybe<UuidComparisonExp>;
	member?: Maybe<StringComparisonExp>;
	roles?: Maybe<TextComparisonExp>;
}

/** unique or primary key constraints on table "staging.role_states" */
export enum StagingRoleStatesConstraint {
	/** unique or primary key constraint */
	RoleStatesGuildMemberKey = 'role_states_guild_member_key',
	/** unique or primary key constraint */
	RoleStatesPkey = 'role_states_pkey',
}

/** input type for inserting data into table "staging.role_states" */
export interface StagingRoleStatesInsertInput {
	guild?: Maybe<Scalars['String']>;
	id?: Maybe<Scalars['uuid']>;
	member?: Maybe<Scalars['String']>;
	roles?: Maybe<Scalars['_text']>;
}

/** aggregate max on columns */
export interface StagingRoleStatesMaxFields {
	guild?: Maybe<Scalars['String']>;
	member?: Maybe<Scalars['String']>;
}

/** order by max() on columns of table "staging.role_states" */
export interface StagingRoleStatesMaxOrderBy {
	guild?: Maybe<OrderBy>;
	member?: Maybe<OrderBy>;
}

/** aggregate min on columns */
export interface StagingRoleStatesMinFields {
	guild?: Maybe<Scalars['String']>;
	member?: Maybe<Scalars['String']>;
}

/** order by min() on columns of table "staging.role_states" */
export interface StagingRoleStatesMinOrderBy {
	guild?: Maybe<OrderBy>;
	member?: Maybe<OrderBy>;
}

/** response of any mutation on the table "staging.role_states" */
export interface StagingRoleStatesMutationResponse {
	/** number of affected rows by the mutation */
	affected_rows: Scalars['Int'];
	/** data of the affected rows by the mutation */
	returning: Array<StagingRoleStates>;
}

/** input type for inserting object relation for remote table "staging.role_states" */
export interface StagingRoleStatesObjRelInsertInput {
	data: StagingRoleStatesInsertInput;
	on_conflict?: Maybe<StagingRoleStatesOnConflict>;
}

/** on conflict condition type for table "staging.role_states" */
export interface StagingRoleStatesOnConflict {
	constraint: StagingRoleStatesConstraint;
	update_columns: Array<StagingRoleStatesUpdateColumn>;
}

/** ordering options when selecting data from "staging.role_states" */
export interface StagingRoleStatesOrderBy {
	guild?: Maybe<OrderBy>;
	id?: Maybe<OrderBy>;
	member?: Maybe<OrderBy>;
	roles?: Maybe<OrderBy>;
}

/** select columns of table "staging.role_states" */
export enum StagingRoleStatesSelectColumn {
	/** column name */
	Guild = 'guild',
	/** column name */
	Id = 'id',
	/** column name */
	Member = 'member',
	/** column name */
	Roles = 'roles',
}

/** input type for updating data in table "staging.role_states" */
export interface StagingRoleStatesSetInput {
	guild?: Maybe<Scalars['String']>;
	id?: Maybe<Scalars['uuid']>;
	member?: Maybe<Scalars['String']>;
	roles?: Maybe<Scalars['_text']>;
}

/** update columns of table "staging.role_states" */
export enum StagingRoleStatesUpdateColumn {
	/** column name */
	Guild = 'guild',
	/** column name */
	Id = 'id',
	/** column name */
	Member = 'member',
	/** column name */
	Roles = 'roles',
}

/** columns and relationships of "staging.settings" */
export interface StagingSettings {
	guild: Scalars['String'];
	settings: Scalars['jsonb'];
}

/** columns and relationships of "staging.settings" */
export interface StagingSettingsSettingsArgs {
	path?: Maybe<Scalars['String']>;
}

/** aggregated selection of "staging.settings" */
export interface StagingSettingsAggregate {
	aggregate?: Maybe<StagingSettingsAggregateFields>;
	nodes: Array<StagingSettings>;
}

/** aggregate fields of "staging.settings" */
export interface StagingSettingsAggregateFields {
	count?: Maybe<Scalars['Int']>;
	max?: Maybe<StagingSettingsMaxFields>;
	min?: Maybe<StagingSettingsMinFields>;
}

/** aggregate fields of "staging.settings" */
export interface StagingSettingsAggregateFieldsCountArgs {
	columns?: Maybe<Array<StagingSettingsSelectColumn>>;
	distinct?: Maybe<Scalars['Boolean']>;
}

/** order by aggregate values of table "staging.settings" */
export interface StagingSettingsAggregateOrderBy {
	count?: Maybe<OrderBy>;
	max?: Maybe<StagingSettingsMaxOrderBy>;
	min?: Maybe<StagingSettingsMinOrderBy>;
}

/** append existing jsonb value of filtered columns with new jsonb value */
export interface StagingSettingsAppendInput {
	settings?: Maybe<Scalars['jsonb']>;
}

/** input type for inserting array relation for remote table "staging.settings" */
export interface StagingSettingsArrRelInsertInput {
	data: Array<StagingSettingsInsertInput>;
	on_conflict?: Maybe<StagingSettingsOnConflict>;
}

/** Boolean expression to filter rows from the table "staging.settings". All fields are combined with a logical 'AND'. */
export interface StagingSettingsBoolExp {
	_and?: Maybe<Array<Maybe<StagingSettingsBoolExp>>>;
	_not?: Maybe<StagingSettingsBoolExp>;
	_or?: Maybe<Array<Maybe<StagingSettingsBoolExp>>>;
	guild?: Maybe<StringComparisonExp>;
	settings?: Maybe<JsonbComparisonExp>;
}

/** unique or primary key constraints on table "staging.settings" */
export enum StagingSettingsConstraint {
	/** unique or primary key constraint */
	SettingsPkey = 'settings_pkey',
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export interface StagingSettingsDeleteAtPathInput {
	settings?: Maybe<Array<Maybe<Scalars['String']>>>;
}

/**
 * delete the array element with specified index (negative integers count from the
 * end). throws an error if top level container is not an array
 **/
export interface StagingSettingsDeleteElemInput {
	settings?: Maybe<Scalars['Int']>;
}

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export interface StagingSettingsDeleteKeyInput {
	settings?: Maybe<Scalars['String']>;
}

/** input type for inserting data into table "staging.settings" */
export interface StagingSettingsInsertInput {
	guild?: Maybe<Scalars['String']>;
	settings?: Maybe<Scalars['jsonb']>;
}

/** aggregate max on columns */
export interface StagingSettingsMaxFields {
	guild?: Maybe<Scalars['String']>;
}

/** order by max() on columns of table "staging.settings" */
export interface StagingSettingsMaxOrderBy {
	guild?: Maybe<OrderBy>;
}

/** aggregate min on columns */
export interface StagingSettingsMinFields {
	guild?: Maybe<Scalars['String']>;
}

/** order by min() on columns of table "staging.settings" */
export interface StagingSettingsMinOrderBy {
	guild?: Maybe<OrderBy>;
}

/** response of any mutation on the table "staging.settings" */
export interface StagingSettingsMutationResponse {
	/** number of affected rows by the mutation */
	affected_rows: Scalars['Int'];
	/** data of the affected rows by the mutation */
	returning: Array<StagingSettings>;
}

/** input type for inserting object relation for remote table "staging.settings" */
export interface StagingSettingsObjRelInsertInput {
	data: StagingSettingsInsertInput;
	on_conflict?: Maybe<StagingSettingsOnConflict>;
}

/** on conflict condition type for table "staging.settings" */
export interface StagingSettingsOnConflict {
	constraint: StagingSettingsConstraint;
	update_columns: Array<StagingSettingsUpdateColumn>;
}

/** ordering options when selecting data from "staging.settings" */
export interface StagingSettingsOrderBy {
	guild?: Maybe<OrderBy>;
	settings?: Maybe<OrderBy>;
}

/** prepend existing jsonb value of filtered columns with new jsonb value */
export interface StagingSettingsPrependInput {
	settings?: Maybe<Scalars['jsonb']>;
}

/** select columns of table "staging.settings" */
export enum StagingSettingsSelectColumn {
	/** column name */
	Guild = 'guild',
	/** column name */
	Settings = 'settings',
}

/** input type for updating data in table "staging.settings" */
export interface StagingSettingsSetInput {
	guild?: Maybe<Scalars['String']>;
	settings?: Maybe<Scalars['jsonb']>;
}

/** update columns of table "staging.settings" */
export enum StagingSettingsUpdateColumn {
	/** column name */
	Guild = 'guild',
	/** column name */
	Settings = 'settings',
}

/** columns and relationships of "staging.tags" */
export interface StagingTags {
	aliases: Scalars['_text'];
	content: Scalars['String'];
	created_at: Scalars['timestamptz'];
	guild: Scalars['String'];
	hoisted?: Maybe<Scalars['Boolean']>;
	id: Scalars['uuid'];
	last_modified?: Maybe<Scalars['String']>;
	name: Scalars['String'];
	updated_at: Scalars['timestamptz'];
	user: Scalars['String'];
	uses: Scalars['Int'];
}

/** aggregated selection of "staging.tags" */
export interface StagingTagsAggregate {
	aggregate?: Maybe<StagingTagsAggregateFields>;
	nodes: Array<StagingTags>;
}

/** aggregate fields of "staging.tags" */
export interface StagingTagsAggregateFields {
	avg?: Maybe<StagingTagsAvgFields>;
	count?: Maybe<Scalars['Int']>;
	max?: Maybe<StagingTagsMaxFields>;
	min?: Maybe<StagingTagsMinFields>;
	stddev?: Maybe<StagingTagsStddevFields>;
	stddev_pop?: Maybe<StagingTagsStddevPopFields>;
	stddev_samp?: Maybe<StagingTagsStddevSampFields>;
	sum?: Maybe<StagingTagsSumFields>;
	var_pop?: Maybe<StagingTagsVarPopFields>;
	var_samp?: Maybe<StagingTagsVarSampFields>;
	variance?: Maybe<StagingTagsVarianceFields>;
}

/** aggregate fields of "staging.tags" */
export interface StagingTagsAggregateFieldsCountArgs {
	columns?: Maybe<Array<StagingTagsSelectColumn>>;
	distinct?: Maybe<Scalars['Boolean']>;
}

/** order by aggregate values of table "staging.tags" */
export interface StagingTagsAggregateOrderBy {
	avg?: Maybe<StagingTagsAvgOrderBy>;
	count?: Maybe<OrderBy>;
	max?: Maybe<StagingTagsMaxOrderBy>;
	min?: Maybe<StagingTagsMinOrderBy>;
	stddev?: Maybe<StagingTagsStddevOrderBy>;
	stddev_pop?: Maybe<StagingTagsStddevPopOrderBy>;
	stddev_samp?: Maybe<StagingTagsStddevSampOrderBy>;
	sum?: Maybe<StagingTagsSumOrderBy>;
	var_pop?: Maybe<StagingTagsVarPopOrderBy>;
	var_samp?: Maybe<StagingTagsVarSampOrderBy>;
	variance?: Maybe<StagingTagsVarianceOrderBy>;
}

/** input type for inserting array relation for remote table "staging.tags" */
export interface StagingTagsArrRelInsertInput {
	data: Array<StagingTagsInsertInput>;
	on_conflict?: Maybe<StagingTagsOnConflict>;
}

/** aggregate avg on columns */
export interface StagingTagsAvgFields {
	uses?: Maybe<Scalars['Float']>;
}

/** order by avg() on columns of table "staging.tags" */
export interface StagingTagsAvgOrderBy {
	uses?: Maybe<OrderBy>;
}

/** Boolean expression to filter rows from the table "staging.tags". All fields are combined with a logical 'AND'. */
export interface StagingTagsBoolExp {
	_and?: Maybe<Array<Maybe<StagingTagsBoolExp>>>;
	_not?: Maybe<StagingTagsBoolExp>;
	_or?: Maybe<Array<Maybe<StagingTagsBoolExp>>>;
	aliases?: Maybe<TextComparisonExp>;
	content?: Maybe<StringComparisonExp>;
	created_at?: Maybe<TimestamptzComparisonExp>;
	guild?: Maybe<StringComparisonExp>;
	hoisted?: Maybe<BooleanComparisonExp>;
	id?: Maybe<UuidComparisonExp>;
	last_modified?: Maybe<StringComparisonExp>;
	name?: Maybe<StringComparisonExp>;
	updated_at?: Maybe<TimestamptzComparisonExp>;
	user?: Maybe<StringComparisonExp>;
	uses?: Maybe<IntComparisonExp>;
}

/** unique or primary key constraints on table "staging.tags" */
export enum StagingTagsConstraint {
	/** unique or primary key constraint */
	TagsGuildNameKey = 'tags_guild_name_key',
	/** unique or primary key constraint */
	TagsPkey = 'tags_pkey',
}

/** input type for incrementing integer columne in table "staging.tags" */
export interface StagingTagsIncInput {
	uses?: Maybe<Scalars['Int']>;
}

/** input type for inserting data into table "staging.tags" */
export interface StagingTagsInsertInput {
	aliases?: Maybe<Scalars['_text']>;
	content?: Maybe<Scalars['String']>;
	created_at?: Maybe<Scalars['timestamptz']>;
	guild?: Maybe<Scalars['String']>;
	hoisted?: Maybe<Scalars['Boolean']>;
	id?: Maybe<Scalars['uuid']>;
	last_modified?: Maybe<Scalars['String']>;
	name?: Maybe<Scalars['String']>;
	updated_at?: Maybe<Scalars['timestamptz']>;
	user?: Maybe<Scalars['String']>;
	uses?: Maybe<Scalars['Int']>;
}

/** aggregate max on columns */
export interface StagingTagsMaxFields {
	content?: Maybe<Scalars['String']>;
	created_at?: Maybe<Scalars['timestamptz']>;
	guild?: Maybe<Scalars['String']>;
	last_modified?: Maybe<Scalars['String']>;
	name?: Maybe<Scalars['String']>;
	updated_at?: Maybe<Scalars['timestamptz']>;
	user?: Maybe<Scalars['String']>;
	uses?: Maybe<Scalars['Int']>;
}

/** order by max() on columns of table "staging.tags" */
export interface StagingTagsMaxOrderBy {
	content?: Maybe<OrderBy>;
	created_at?: Maybe<OrderBy>;
	guild?: Maybe<OrderBy>;
	last_modified?: Maybe<OrderBy>;
	name?: Maybe<OrderBy>;
	updated_at?: Maybe<OrderBy>;
	user?: Maybe<OrderBy>;
	uses?: Maybe<OrderBy>;
}

/** aggregate min on columns */
export interface StagingTagsMinFields {
	content?: Maybe<Scalars['String']>;
	created_at?: Maybe<Scalars['timestamptz']>;
	guild?: Maybe<Scalars['String']>;
	last_modified?: Maybe<Scalars['String']>;
	name?: Maybe<Scalars['String']>;
	updated_at?: Maybe<Scalars['timestamptz']>;
	user?: Maybe<Scalars['String']>;
	uses?: Maybe<Scalars['Int']>;
}

/** order by min() on columns of table "staging.tags" */
export interface StagingTagsMinOrderBy {
	content?: Maybe<OrderBy>;
	created_at?: Maybe<OrderBy>;
	guild?: Maybe<OrderBy>;
	last_modified?: Maybe<OrderBy>;
	name?: Maybe<OrderBy>;
	updated_at?: Maybe<OrderBy>;
	user?: Maybe<OrderBy>;
	uses?: Maybe<OrderBy>;
}

/** response of any mutation on the table "staging.tags" */
export interface StagingTagsMutationResponse {
	/** number of affected rows by the mutation */
	affected_rows: Scalars['Int'];
	/** data of the affected rows by the mutation */
	returning: Array<StagingTags>;
}

/** input type for inserting object relation for remote table "staging.tags" */
export interface StagingTagsObjRelInsertInput {
	data: StagingTagsInsertInput;
	on_conflict?: Maybe<StagingTagsOnConflict>;
}

/** on conflict condition type for table "staging.tags" */
export interface StagingTagsOnConflict {
	constraint: StagingTagsConstraint;
	update_columns: Array<StagingTagsUpdateColumn>;
}

/** ordering options when selecting data from "staging.tags" */
export interface StagingTagsOrderBy {
	aliases?: Maybe<OrderBy>;
	content?: Maybe<OrderBy>;
	created_at?: Maybe<OrderBy>;
	guild?: Maybe<OrderBy>;
	hoisted?: Maybe<OrderBy>;
	id?: Maybe<OrderBy>;
	last_modified?: Maybe<OrderBy>;
	name?: Maybe<OrderBy>;
	updated_at?: Maybe<OrderBy>;
	user?: Maybe<OrderBy>;
	uses?: Maybe<OrderBy>;
}

/** select columns of table "staging.tags" */
export enum StagingTagsSelectColumn {
	/** column name */
	Aliases = 'aliases',
	/** column name */
	Content = 'content',
	/** column name */
	CreatedAt = 'created_at',
	/** column name */
	Guild = 'guild',
	/** column name */
	Hoisted = 'hoisted',
	/** column name */
	Id = 'id',
	/** column name */
	LastModified = 'last_modified',
	/** column name */
	Name = 'name',
	/** column name */
	UpdatedAt = 'updated_at',
	/** column name */
	User = 'user',
	/** column name */
	Uses = 'uses',
}

/** input type for updating data in table "staging.tags" */
export interface StagingTagsSetInput {
	aliases?: Maybe<Scalars['_text']>;
	content?: Maybe<Scalars['String']>;
	created_at?: Maybe<Scalars['timestamptz']>;
	guild?: Maybe<Scalars['String']>;
	hoisted?: Maybe<Scalars['Boolean']>;
	id?: Maybe<Scalars['uuid']>;
	last_modified?: Maybe<Scalars['String']>;
	name?: Maybe<Scalars['String']>;
	updated_at?: Maybe<Scalars['timestamptz']>;
	user?: Maybe<Scalars['String']>;
	uses?: Maybe<Scalars['Int']>;
}

/** aggregate stddev on columns */
export interface StagingTagsStddevFields {
	uses?: Maybe<Scalars['Float']>;
}

/** order by stddev() on columns of table "staging.tags" */
export interface StagingTagsStddevOrderBy {
	uses?: Maybe<OrderBy>;
}

/** aggregate stddev_pop on columns */
export interface StagingTagsStddevPopFields {
	uses?: Maybe<Scalars['Float']>;
}

/** order by stddev_pop() on columns of table "staging.tags" */
export interface StagingTagsStddevPopOrderBy {
	uses?: Maybe<OrderBy>;
}

/** aggregate stddev_samp on columns */
export interface StagingTagsStddevSampFields {
	uses?: Maybe<Scalars['Float']>;
}

/** order by stddev_samp() on columns of table "staging.tags" */
export interface StagingTagsStddevSampOrderBy {
	uses?: Maybe<OrderBy>;
}

/** aggregate sum on columns */
export interface StagingTagsSumFields {
	uses?: Maybe<Scalars['Int']>;
}

/** order by sum() on columns of table "staging.tags" */
export interface StagingTagsSumOrderBy {
	uses?: Maybe<OrderBy>;
}

/** update columns of table "staging.tags" */
export enum StagingTagsUpdateColumn {
	/** column name */
	Aliases = 'aliases',
	/** column name */
	Content = 'content',
	/** column name */
	CreatedAt = 'created_at',
	/** column name */
	Guild = 'guild',
	/** column name */
	Hoisted = 'hoisted',
	/** column name */
	Id = 'id',
	/** column name */
	LastModified = 'last_modified',
	/** column name */
	Name = 'name',
	/** column name */
	UpdatedAt = 'updated_at',
	/** column name */
	User = 'user',
	/** column name */
	Uses = 'uses',
}

/** aggregate var_pop on columns */
export interface StagingTagsVarPopFields {
	uses?: Maybe<Scalars['Float']>;
}

/** order by var_pop() on columns of table "staging.tags" */
export interface StagingTagsVarPopOrderBy {
	uses?: Maybe<OrderBy>;
}

/** aggregate var_samp on columns */
export interface StagingTagsVarSampFields {
	uses?: Maybe<Scalars['Float']>;
}

/** order by var_samp() on columns of table "staging.tags" */
export interface StagingTagsVarSampOrderBy {
	uses?: Maybe<OrderBy>;
}

/** aggregate variance on columns */
export interface StagingTagsVarianceFields {
	uses?: Maybe<Scalars['Float']>;
}

/** order by variance() on columns of table "staging.tags" */
export interface StagingTagsVarianceOrderBy {
	uses?: Maybe<OrderBy>;
}

/** expression to compare columns of type String. All fields are combined with logical 'AND'. */
export interface StringComparisonExp {
	_eq?: Maybe<Scalars['String']>;
	_gt?: Maybe<Scalars['String']>;
	_gte?: Maybe<Scalars['String']>;
	_ilike?: Maybe<Scalars['String']>;
	_in?: Maybe<Array<Scalars['String']>>;
	_is_null?: Maybe<Scalars['Boolean']>;
	_like?: Maybe<Scalars['String']>;
	_lt?: Maybe<Scalars['String']>;
	_lte?: Maybe<Scalars['String']>;
	_neq?: Maybe<Scalars['String']>;
	_nilike?: Maybe<Scalars['String']>;
	_nin?: Maybe<Array<Scalars['String']>>;
	_nlike?: Maybe<Scalars['String']>;
	_nsimilar?: Maybe<Scalars['String']>;
	_similar?: Maybe<Scalars['String']>;
}

/** subscription root */
export interface SubscriptionRoot {
	/** fetch data from the table: "cases" */
	cases: Array<Cases>;
	/** fetch aggregated fields from the table: "cases" */
	cases_aggregate: CasesAggregate;
	/** fetch data from the table: "cases" using primary key columns */
	cases_by_pk?: Maybe<Cases>;
	/** fetch data from the table: "role_states" */
	role_states: Array<RoleStates>;
	/** fetch aggregated fields from the table: "role_states" */
	role_states_aggregate: RoleStatesAggregate;
	/** fetch data from the table: "role_states" using primary key columns */
	role_states_by_pk?: Maybe<RoleStates>;
	/** fetch data from the table: "settings" */
	settings: Array<Settings>;
	/** fetch aggregated fields from the table: "settings" */
	settings_aggregate: SettingsAggregate;
	/** fetch data from the table: "settings" using primary key columns */
	settings_by_pk?: Maybe<Settings>;
	/** fetch data from the table: "staging.cases" */
	staging_cases: Array<StagingCases>;
	/** fetch aggregated fields from the table: "staging.cases" */
	staging_cases_aggregate: StagingCasesAggregate;
	/** fetch data from the table: "staging.cases" using primary key columns */
	staging_cases_by_pk?: Maybe<StagingCases>;
	/** fetch data from the table: "staging.role_states" */
	staging_role_states: Array<StagingRoleStates>;
	/** fetch aggregated fields from the table: "staging.role_states" */
	staging_role_states_aggregate: StagingRoleStatesAggregate;
	/** fetch data from the table: "staging.role_states" using primary key columns */
	staging_role_states_by_pk?: Maybe<StagingRoleStates>;
	/** fetch data from the table: "staging.settings" */
	staging_settings: Array<StagingSettings>;
	/** fetch aggregated fields from the table: "staging.settings" */
	staging_settings_aggregate: StagingSettingsAggregate;
	/** fetch data from the table: "staging.settings" using primary key columns */
	staging_settings_by_pk?: Maybe<StagingSettings>;
	/** fetch data from the table: "staging.tags" */
	staging_tags: Array<StagingTags>;
	/** fetch aggregated fields from the table: "staging.tags" */
	staging_tags_aggregate: StagingTagsAggregate;
	/** fetch data from the table: "staging.tags" using primary key columns */
	staging_tags_by_pk?: Maybe<StagingTags>;
	/** fetch data from the table: "tags" */
	tags: Array<Tags>;
	/** fetch aggregated fields from the table: "tags" */
	tags_aggregate: TagsAggregate;
	/** fetch data from the table: "tags" using primary key columns */
	tags_by_pk?: Maybe<Tags>;
}

/** subscription root */
export interface SubscriptionRootCasesArgs {
	distinct_on?: Maybe<Array<CasesSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<CasesOrderBy>>;
	where?: Maybe<CasesBoolExp>;
}

/** subscription root */
export interface SubscriptionRootCasesAggregateArgs {
	distinct_on?: Maybe<Array<CasesSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<CasesOrderBy>>;
	where?: Maybe<CasesBoolExp>;
}

/** subscription root */
export interface SubscriptionRootCasesByPkArgs {
	id: Scalars['uuid'];
}

/** subscription root */
export interface SubscriptionRootRoleStatesArgs {
	distinct_on?: Maybe<Array<RoleStatesSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<RoleStatesOrderBy>>;
	where?: Maybe<RoleStatesBoolExp>;
}

/** subscription root */
export interface SubscriptionRootRoleStatesAggregateArgs {
	distinct_on?: Maybe<Array<RoleStatesSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<RoleStatesOrderBy>>;
	where?: Maybe<RoleStatesBoolExp>;
}

/** subscription root */
export interface SubscriptionRootRoleStatesByPkArgs {
	id: Scalars['uuid'];
}

/** subscription root */
export interface SubscriptionRootSettingsArgs {
	distinct_on?: Maybe<Array<SettingsSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<SettingsOrderBy>>;
	where?: Maybe<SettingsBoolExp>;
}

/** subscription root */
export interface SubscriptionRootSettingsAggregateArgs {
	distinct_on?: Maybe<Array<SettingsSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<SettingsOrderBy>>;
	where?: Maybe<SettingsBoolExp>;
}

/** subscription root */
export interface SubscriptionRootSettingsByPkArgs {
	guild: Scalars['String'];
}

/** subscription root */
export interface SubscriptionRootStagingCasesArgs {
	distinct_on?: Maybe<Array<StagingCasesSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<StagingCasesOrderBy>>;
	where?: Maybe<StagingCasesBoolExp>;
}

/** subscription root */
export interface SubscriptionRootStagingCasesAggregateArgs {
	distinct_on?: Maybe<Array<StagingCasesSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<StagingCasesOrderBy>>;
	where?: Maybe<StagingCasesBoolExp>;
}

/** subscription root */
export interface SubscriptionRootStagingCasesByPkArgs {
	id: Scalars['uuid'];
}

/** subscription root */
export interface SubscriptionRootStagingRoleStatesArgs {
	distinct_on?: Maybe<Array<StagingRoleStatesSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<StagingRoleStatesOrderBy>>;
	where?: Maybe<StagingRoleStatesBoolExp>;
}

/** subscription root */
export interface SubscriptionRootStagingRoleStatesAggregateArgs {
	distinct_on?: Maybe<Array<StagingRoleStatesSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<StagingRoleStatesOrderBy>>;
	where?: Maybe<StagingRoleStatesBoolExp>;
}

/** subscription root */
export interface SubscriptionRootStagingRoleStatesByPkArgs {
	id: Scalars['uuid'];
}

/** subscription root */
export interface SubscriptionRootStagingSettingsArgs {
	distinct_on?: Maybe<Array<StagingSettingsSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<StagingSettingsOrderBy>>;
	where?: Maybe<StagingSettingsBoolExp>;
}

/** subscription root */
export interface SubscriptionRootStagingSettingsAggregateArgs {
	distinct_on?: Maybe<Array<StagingSettingsSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<StagingSettingsOrderBy>>;
	where?: Maybe<StagingSettingsBoolExp>;
}

/** subscription root */
export interface SubscriptionRootStagingSettingsByPkArgs {
	guild: Scalars['String'];
}

/** subscription root */
export interface SubscriptionRootStagingTagsArgs {
	distinct_on?: Maybe<Array<StagingTagsSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<StagingTagsOrderBy>>;
	where?: Maybe<StagingTagsBoolExp>;
}

/** subscription root */
export interface SubscriptionRootStagingTagsAggregateArgs {
	distinct_on?: Maybe<Array<StagingTagsSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<StagingTagsOrderBy>>;
	where?: Maybe<StagingTagsBoolExp>;
}

/** subscription root */
export interface SubscriptionRootStagingTagsByPkArgs {
	id: Scalars['uuid'];
}

/** subscription root */
export interface SubscriptionRootTagsArgs {
	distinct_on?: Maybe<Array<TagsSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<TagsOrderBy>>;
	where?: Maybe<TagsBoolExp>;
}

/** subscription root */
export interface SubscriptionRootTagsAggregateArgs {
	distinct_on?: Maybe<Array<TagsSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<TagsOrderBy>>;
	where?: Maybe<TagsBoolExp>;
}

/** subscription root */
export interface SubscriptionRootTagsByPkArgs {
	id: Scalars['uuid'];
}

/** columns and relationships of "tags" */
export interface Tags {
	aliases: Scalars['_text'];
	content: Scalars['String'];
	created_at: Scalars['timestamptz'];
	guild: Scalars['String'];
	hoisted?: Maybe<Scalars['Boolean']>;
	id: Scalars['uuid'];
	last_modified?: Maybe<Scalars['String']>;
	name: Scalars['String'];
	updated_at: Scalars['timestamptz'];
	user: Scalars['String'];
	uses: Scalars['Int'];
}

/** aggregated selection of "tags" */
export interface TagsAggregate {
	aggregate?: Maybe<TagsAggregateFields>;
	nodes: Array<Tags>;
}

/** aggregate fields of "tags" */
export interface TagsAggregateFields {
	avg?: Maybe<TagsAvgFields>;
	count?: Maybe<Scalars['Int']>;
	max?: Maybe<TagsMaxFields>;
	min?: Maybe<TagsMinFields>;
	stddev?: Maybe<TagsStddevFields>;
	stddev_pop?: Maybe<TagsStddevPopFields>;
	stddev_samp?: Maybe<TagsStddevSampFields>;
	sum?: Maybe<TagsSumFields>;
	var_pop?: Maybe<TagsVarPopFields>;
	var_samp?: Maybe<TagsVarSampFields>;
	variance?: Maybe<TagsVarianceFields>;
}

/** aggregate fields of "tags" */
export interface TagsAggregateFieldsCountArgs {
	columns?: Maybe<Array<TagsSelectColumn>>;
	distinct?: Maybe<Scalars['Boolean']>;
}

/** order by aggregate values of table "tags" */
export interface TagsAggregateOrderBy {
	avg?: Maybe<TagsAvgOrderBy>;
	count?: Maybe<OrderBy>;
	max?: Maybe<TagsMaxOrderBy>;
	min?: Maybe<TagsMinOrderBy>;
	stddev?: Maybe<TagsStddevOrderBy>;
	stddev_pop?: Maybe<TagsStddevPopOrderBy>;
	stddev_samp?: Maybe<TagsStddevSampOrderBy>;
	sum?: Maybe<TagsSumOrderBy>;
	var_pop?: Maybe<TagsVarPopOrderBy>;
	var_samp?: Maybe<TagsVarSampOrderBy>;
	variance?: Maybe<TagsVarianceOrderBy>;
}

/** input type for inserting array relation for remote table "tags" */
export interface TagsArrRelInsertInput {
	data: Array<TagsInsertInput>;
	on_conflict?: Maybe<TagsOnConflict>;
}

/** aggregate avg on columns */
export interface TagsAvgFields {
	uses?: Maybe<Scalars['Float']>;
}

/** order by avg() on columns of table "tags" */
export interface TagsAvgOrderBy {
	uses?: Maybe<OrderBy>;
}

/** Boolean expression to filter rows from the table "tags". All fields are combined with a logical 'AND'. */
export interface TagsBoolExp {
	_and?: Maybe<Array<Maybe<TagsBoolExp>>>;
	_not?: Maybe<TagsBoolExp>;
	_or?: Maybe<Array<Maybe<TagsBoolExp>>>;
	aliases?: Maybe<TextComparisonExp>;
	content?: Maybe<StringComparisonExp>;
	created_at?: Maybe<TimestamptzComparisonExp>;
	guild?: Maybe<StringComparisonExp>;
	hoisted?: Maybe<BooleanComparisonExp>;
	id?: Maybe<UuidComparisonExp>;
	last_modified?: Maybe<StringComparisonExp>;
	name?: Maybe<StringComparisonExp>;
	updated_at?: Maybe<TimestamptzComparisonExp>;
	user?: Maybe<StringComparisonExp>;
	uses?: Maybe<IntComparisonExp>;
}

/** unique or primary key constraints on table "tags" */
export enum TagsConstraint {
	/** unique or primary key constraint */
	TagsGuildNameKey = 'tags_guild_name_key',
	/** unique or primary key constraint */
	TagsPkey = 'tags_pkey',
}

/** input type for incrementing integer columne in table "tags" */
export interface TagsIncInput {
	uses?: Maybe<Scalars['Int']>;
}

/** input type for inserting data into table "tags" */
export interface TagsInsertInput {
	aliases?: Maybe<Scalars['_text']>;
	content?: Maybe<Scalars['String']>;
	created_at?: Maybe<Scalars['timestamptz']>;
	guild?: Maybe<Scalars['String']>;
	hoisted?: Maybe<Scalars['Boolean']>;
	id?: Maybe<Scalars['uuid']>;
	last_modified?: Maybe<Scalars['String']>;
	name?: Maybe<Scalars['String']>;
	updated_at?: Maybe<Scalars['timestamptz']>;
	user?: Maybe<Scalars['String']>;
	uses?: Maybe<Scalars['Int']>;
}

/** aggregate max on columns */
export interface TagsMaxFields {
	content?: Maybe<Scalars['String']>;
	created_at?: Maybe<Scalars['timestamptz']>;
	guild?: Maybe<Scalars['String']>;
	last_modified?: Maybe<Scalars['String']>;
	name?: Maybe<Scalars['String']>;
	updated_at?: Maybe<Scalars['timestamptz']>;
	user?: Maybe<Scalars['String']>;
	uses?: Maybe<Scalars['Int']>;
}

/** order by max() on columns of table "tags" */
export interface TagsMaxOrderBy {
	content?: Maybe<OrderBy>;
	created_at?: Maybe<OrderBy>;
	guild?: Maybe<OrderBy>;
	last_modified?: Maybe<OrderBy>;
	name?: Maybe<OrderBy>;
	updated_at?: Maybe<OrderBy>;
	user?: Maybe<OrderBy>;
	uses?: Maybe<OrderBy>;
}

/** aggregate min on columns */
export interface TagsMinFields {
	content?: Maybe<Scalars['String']>;
	created_at?: Maybe<Scalars['timestamptz']>;
	guild?: Maybe<Scalars['String']>;
	last_modified?: Maybe<Scalars['String']>;
	name?: Maybe<Scalars['String']>;
	updated_at?: Maybe<Scalars['timestamptz']>;
	user?: Maybe<Scalars['String']>;
	uses?: Maybe<Scalars['Int']>;
}

/** order by min() on columns of table "tags" */
export interface TagsMinOrderBy {
	content?: Maybe<OrderBy>;
	created_at?: Maybe<OrderBy>;
	guild?: Maybe<OrderBy>;
	last_modified?: Maybe<OrderBy>;
	name?: Maybe<OrderBy>;
	updated_at?: Maybe<OrderBy>;
	user?: Maybe<OrderBy>;
	uses?: Maybe<OrderBy>;
}

/** response of any mutation on the table "tags" */
export interface TagsMutationResponse {
	/** number of affected rows by the mutation */
	affected_rows: Scalars['Int'];
	/** data of the affected rows by the mutation */
	returning: Array<Tags>;
}

/** input type for inserting object relation for remote table "tags" */
export interface TagsObjRelInsertInput {
	data: TagsInsertInput;
	on_conflict?: Maybe<TagsOnConflict>;
}

/** on conflict condition type for table "tags" */
export interface TagsOnConflict {
	constraint: TagsConstraint;
	update_columns: Array<TagsUpdateColumn>;
}

/** ordering options when selecting data from "tags" */
export interface TagsOrderBy {
	aliases?: Maybe<OrderBy>;
	content?: Maybe<OrderBy>;
	created_at?: Maybe<OrderBy>;
	guild?: Maybe<OrderBy>;
	hoisted?: Maybe<OrderBy>;
	id?: Maybe<OrderBy>;
	last_modified?: Maybe<OrderBy>;
	name?: Maybe<OrderBy>;
	updated_at?: Maybe<OrderBy>;
	user?: Maybe<OrderBy>;
	uses?: Maybe<OrderBy>;
}

/** select columns of table "tags" */
export enum TagsSelectColumn {
	/** column name */
	Aliases = 'aliases',
	/** column name */
	Content = 'content',
	/** column name */
	CreatedAt = 'created_at',
	/** column name */
	Guild = 'guild',
	/** column name */
	Hoisted = 'hoisted',
	/** column name */
	Id = 'id',
	/** column name */
	LastModified = 'last_modified',
	/** column name */
	Name = 'name',
	/** column name */
	UpdatedAt = 'updated_at',
	/** column name */
	User = 'user',
	/** column name */
	Uses = 'uses',
}

/** input type for updating data in table "tags" */
export interface TagsSetInput {
	aliases?: Maybe<Scalars['_text']>;
	content?: Maybe<Scalars['String']>;
	created_at?: Maybe<Scalars['timestamptz']>;
	guild?: Maybe<Scalars['String']>;
	hoisted?: Maybe<Scalars['Boolean']>;
	id?: Maybe<Scalars['uuid']>;
	last_modified?: Maybe<Scalars['String']>;
	name?: Maybe<Scalars['String']>;
	updated_at?: Maybe<Scalars['timestamptz']>;
	user?: Maybe<Scalars['String']>;
	uses?: Maybe<Scalars['Int']>;
}

/** aggregate stddev on columns */
export interface TagsStddevFields {
	uses?: Maybe<Scalars['Float']>;
}

/** order by stddev() on columns of table "tags" */
export interface TagsStddevOrderBy {
	uses?: Maybe<OrderBy>;
}

/** aggregate stddev_pop on columns */
export interface TagsStddevPopFields {
	uses?: Maybe<Scalars['Float']>;
}

/** order by stddev_pop() on columns of table "tags" */
export interface TagsStddevPopOrderBy {
	uses?: Maybe<OrderBy>;
}

/** aggregate stddev_samp on columns */
export interface TagsStddevSampFields {
	uses?: Maybe<Scalars['Float']>;
}

/** order by stddev_samp() on columns of table "tags" */
export interface TagsStddevSampOrderBy {
	uses?: Maybe<OrderBy>;
}

/** aggregate sum on columns */
export interface TagsSumFields {
	uses?: Maybe<Scalars['Int']>;
}

/** order by sum() on columns of table "tags" */
export interface TagsSumOrderBy {
	uses?: Maybe<OrderBy>;
}

/** update columns of table "tags" */
export enum TagsUpdateColumn {
	/** column name */
	Aliases = 'aliases',
	/** column name */
	Content = 'content',
	/** column name */
	CreatedAt = 'created_at',
	/** column name */
	Guild = 'guild',
	/** column name */
	Hoisted = 'hoisted',
	/** column name */
	Id = 'id',
	/** column name */
	LastModified = 'last_modified',
	/** column name */
	Name = 'name',
	/** column name */
	UpdatedAt = 'updated_at',
	/** column name */
	User = 'user',
	/** column name */
	Uses = 'uses',
}

/** aggregate var_pop on columns */
export interface TagsVarPopFields {
	uses?: Maybe<Scalars['Float']>;
}

/** order by var_pop() on columns of table "tags" */
export interface TagsVarPopOrderBy {
	uses?: Maybe<OrderBy>;
}

/** aggregate var_samp on columns */
export interface TagsVarSampFields {
	uses?: Maybe<Scalars['Float']>;
}

/** order by var_samp() on columns of table "tags" */
export interface TagsVarSampOrderBy {
	uses?: Maybe<OrderBy>;
}

/** aggregate variance on columns */
export interface TagsVarianceFields {
	uses?: Maybe<Scalars['Float']>;
}

/** order by variance() on columns of table "tags" */
export interface TagsVarianceOrderBy {
	uses?: Maybe<OrderBy>;
}

/** expression to compare columns of type timestamptz. All fields are combined with logical 'AND'. */
export interface TimestamptzComparisonExp {
	_eq?: Maybe<Scalars['timestamptz']>;
	_gt?: Maybe<Scalars['timestamptz']>;
	_gte?: Maybe<Scalars['timestamptz']>;
	_in?: Maybe<Array<Scalars['timestamptz']>>;
	_is_null?: Maybe<Scalars['Boolean']>;
	_lt?: Maybe<Scalars['timestamptz']>;
	_lte?: Maybe<Scalars['timestamptz']>;
	_neq?: Maybe<Scalars['timestamptz']>;
	_nin?: Maybe<Array<Scalars['timestamptz']>>;
}

/** expression to compare columns of type uuid. All fields are combined with logical 'AND'. */
export interface UuidComparisonExp {
	_eq?: Maybe<Scalars['uuid']>;
	_gt?: Maybe<Scalars['uuid']>;
	_gte?: Maybe<Scalars['uuid']>;
	_in?: Maybe<Array<Scalars['uuid']>>;
	_is_null?: Maybe<Scalars['Boolean']>;
	_lt?: Maybe<Scalars['uuid']>;
	_lte?: Maybe<Scalars['uuid']>;
	_neq?: Maybe<Scalars['uuid']>;
	_nin?: Maybe<Array<Scalars['uuid']>>;
}

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

export interface Cases {
	action: Scalars['Int'];
	actionDuration?: Maybe<Scalars['timestamptz']>;
	actionProcessed?: Maybe<Scalars['Boolean']>;
	caseId: Scalars['Int'];
	createdAt: Scalars['timestamptz'];
	guild: Scalars['String'];
	id: Scalars['uuid'];
	message?: Maybe<Scalars['String']>;
	modId?: Maybe<Scalars['String']>;
	modTag?: Maybe<Scalars['String']>;
	muteMessage?: Maybe<Scalars['String']>;
	reason?: Maybe<Scalars['String']>;
	refId?: Maybe<Scalars['Int']>;
	targetId: Scalars['String'];
	targetTag: Scalars['String'];
}

export interface CasesAggregate {
	aggregate?: Maybe<CasesAggregateFields>;
	nodes: Array<Cases>;
}

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

export interface CasesAggregateFieldsCountArgs {
	columns?: Maybe<Array<CasesSelectColumn>>;
	distinct?: Maybe<Scalars['Boolean']>;
}

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

export interface CasesArrRelInsertInput {
	data: Array<CasesInsertInput>;
	on_conflict?: Maybe<CasesOnConflict>;
}

export interface CasesAvgFields {
	action?: Maybe<Scalars['Float']>;
	caseId?: Maybe<Scalars['Float']>;
	refId?: Maybe<Scalars['Float']>;
}

export interface CasesAvgOrderBy {
	action?: Maybe<OrderBy>;
	caseId?: Maybe<OrderBy>;
	refId?: Maybe<OrderBy>;
}

export interface CasesBoolExp {
	_and?: Maybe<Array<Maybe<CasesBoolExp>>>;
	_not?: Maybe<CasesBoolExp>;
	_or?: Maybe<Array<Maybe<CasesBoolExp>>>;
	action?: Maybe<IntComparisonExp>;
	actionDuration?: Maybe<TimestamptzComparisonExp>;
	actionProcessed?: Maybe<BooleanComparisonExp>;
	caseId?: Maybe<IntComparisonExp>;
	createdAt?: Maybe<TimestamptzComparisonExp>;
	guild?: Maybe<StringComparisonExp>;
	id?: Maybe<UuidComparisonExp>;
	message?: Maybe<StringComparisonExp>;
	modId?: Maybe<StringComparisonExp>;
	modTag?: Maybe<StringComparisonExp>;
	muteMessage?: Maybe<StringComparisonExp>;
	reason?: Maybe<StringComparisonExp>;
	refId?: Maybe<IntComparisonExp>;
	targetId?: Maybe<StringComparisonExp>;
	targetTag?: Maybe<StringComparisonExp>;
}

export enum CasesConstraint {
	CasesPkey = 'cases_pkey',
}

export interface CasesIncInput {
	action?: Maybe<Scalars['Int']>;
	caseId?: Maybe<Scalars['Int']>;
	refId?: Maybe<Scalars['Int']>;
}

export interface CasesInsertInput {
	action?: Maybe<Scalars['Int']>;
	actionDuration?: Maybe<Scalars['timestamptz']>;
	actionProcessed?: Maybe<Scalars['Boolean']>;
	caseId?: Maybe<Scalars['Int']>;
	createdAt?: Maybe<Scalars['timestamptz']>;
	guild?: Maybe<Scalars['String']>;
	id?: Maybe<Scalars['uuid']>;
	message?: Maybe<Scalars['String']>;
	modId?: Maybe<Scalars['String']>;
	modTag?: Maybe<Scalars['String']>;
	muteMessage?: Maybe<Scalars['String']>;
	reason?: Maybe<Scalars['String']>;
	refId?: Maybe<Scalars['Int']>;
	targetId?: Maybe<Scalars['String']>;
	targetTag?: Maybe<Scalars['String']>;
}

export interface CasesMaxFields {
	action?: Maybe<Scalars['Int']>;
	actionDuration?: Maybe<Scalars['timestamptz']>;
	caseId?: Maybe<Scalars['Int']>;
	createdAt?: Maybe<Scalars['timestamptz']>;
	guild?: Maybe<Scalars['String']>;
	message?: Maybe<Scalars['String']>;
	modId?: Maybe<Scalars['String']>;
	modTag?: Maybe<Scalars['String']>;
	muteMessage?: Maybe<Scalars['String']>;
	reason?: Maybe<Scalars['String']>;
	refId?: Maybe<Scalars['Int']>;
	targetId?: Maybe<Scalars['String']>;
	targetTag?: Maybe<Scalars['String']>;
}

export interface CasesMaxOrderBy {
	action?: Maybe<OrderBy>;
	actionDuration?: Maybe<OrderBy>;
	caseId?: Maybe<OrderBy>;
	createdAt?: Maybe<OrderBy>;
	guild?: Maybe<OrderBy>;
	message?: Maybe<OrderBy>;
	modId?: Maybe<OrderBy>;
	modTag?: Maybe<OrderBy>;
	muteMessage?: Maybe<OrderBy>;
	reason?: Maybe<OrderBy>;
	refId?: Maybe<OrderBy>;
	targetId?: Maybe<OrderBy>;
	targetTag?: Maybe<OrderBy>;
}

export interface CasesMinFields {
	action?: Maybe<Scalars['Int']>;
	actionDuration?: Maybe<Scalars['timestamptz']>;
	caseId?: Maybe<Scalars['Int']>;
	createdAt?: Maybe<Scalars['timestamptz']>;
	guild?: Maybe<Scalars['String']>;
	message?: Maybe<Scalars['String']>;
	modId?: Maybe<Scalars['String']>;
	modTag?: Maybe<Scalars['String']>;
	muteMessage?: Maybe<Scalars['String']>;
	reason?: Maybe<Scalars['String']>;
	refId?: Maybe<Scalars['Int']>;
	targetId?: Maybe<Scalars['String']>;
	targetTag?: Maybe<Scalars['String']>;
}

export interface CasesMinOrderBy {
	action?: Maybe<OrderBy>;
	actionDuration?: Maybe<OrderBy>;
	caseId?: Maybe<OrderBy>;
	createdAt?: Maybe<OrderBy>;
	guild?: Maybe<OrderBy>;
	message?: Maybe<OrderBy>;
	modId?: Maybe<OrderBy>;
	modTag?: Maybe<OrderBy>;
	muteMessage?: Maybe<OrderBy>;
	reason?: Maybe<OrderBy>;
	refId?: Maybe<OrderBy>;
	targetId?: Maybe<OrderBy>;
	targetTag?: Maybe<OrderBy>;
}

export interface CasesMutationResponse {
	affected_rows: Scalars['Int'];
	returning: Array<Cases>;
}

export interface CasesObjRelInsertInput {
	data: CasesInsertInput;
	on_conflict?: Maybe<CasesOnConflict>;
}

export interface CasesOnConflict {
	constraint: CasesConstraint;
	update_columns: Array<CasesUpdateColumn>;
	where?: Maybe<CasesBoolExp>;
}

export interface CasesOrderBy {
	action?: Maybe<OrderBy>;
	actionDuration?: Maybe<OrderBy>;
	actionProcessed?: Maybe<OrderBy>;
	caseId?: Maybe<OrderBy>;
	createdAt?: Maybe<OrderBy>;
	guild?: Maybe<OrderBy>;
	id?: Maybe<OrderBy>;
	message?: Maybe<OrderBy>;
	modId?: Maybe<OrderBy>;
	modTag?: Maybe<OrderBy>;
	muteMessage?: Maybe<OrderBy>;
	reason?: Maybe<OrderBy>;
	refId?: Maybe<OrderBy>;
	targetId?: Maybe<OrderBy>;
	targetTag?: Maybe<OrderBy>;
}

export enum CasesSelectColumn {
	Action = 'action',
	ActionDuration = 'actionDuration',
	ActionProcessed = 'actionProcessed',
	CaseId = 'caseId',
	CreatedAt = 'createdAt',
	Guild = 'guild',
	Id = 'id',
	Message = 'message',
	ModId = 'modId',
	ModTag = 'modTag',
	MuteMessage = 'muteMessage',
	Reason = 'reason',
	RefId = 'refId',
	TargetId = 'targetId',
	TargetTag = 'targetTag',
}

export interface CasesSetInput {
	action?: Maybe<Scalars['Int']>;
	actionDuration?: Maybe<Scalars['timestamptz']>;
	actionProcessed?: Maybe<Scalars['Boolean']>;
	caseId?: Maybe<Scalars['Int']>;
	createdAt?: Maybe<Scalars['timestamptz']>;
	guild?: Maybe<Scalars['String']>;
	id?: Maybe<Scalars['uuid']>;
	message?: Maybe<Scalars['String']>;
	modId?: Maybe<Scalars['String']>;
	modTag?: Maybe<Scalars['String']>;
	muteMessage?: Maybe<Scalars['String']>;
	reason?: Maybe<Scalars['String']>;
	refId?: Maybe<Scalars['Int']>;
	targetId?: Maybe<Scalars['String']>;
	targetTag?: Maybe<Scalars['String']>;
}

export interface CasesStddevFields {
	action?: Maybe<Scalars['Float']>;
	caseId?: Maybe<Scalars['Float']>;
	refId?: Maybe<Scalars['Float']>;
}

export interface CasesStddevOrderBy {
	action?: Maybe<OrderBy>;
	caseId?: Maybe<OrderBy>;
	refId?: Maybe<OrderBy>;
}

export interface CasesStddevPopFields {
	action?: Maybe<Scalars['Float']>;
	caseId?: Maybe<Scalars['Float']>;
	refId?: Maybe<Scalars['Float']>;
}

export interface CasesStddevPopOrderBy {
	action?: Maybe<OrderBy>;
	caseId?: Maybe<OrderBy>;
	refId?: Maybe<OrderBy>;
}

export interface CasesStddevSampFields {
	action?: Maybe<Scalars['Float']>;
	caseId?: Maybe<Scalars['Float']>;
	refId?: Maybe<Scalars['Float']>;
}

export interface CasesStddevSampOrderBy {
	action?: Maybe<OrderBy>;
	caseId?: Maybe<OrderBy>;
	refId?: Maybe<OrderBy>;
}

export interface CasesSumFields {
	action?: Maybe<Scalars['Int']>;
	caseId?: Maybe<Scalars['Int']>;
	refId?: Maybe<Scalars['Int']>;
}

export interface CasesSumOrderBy {
	action?: Maybe<OrderBy>;
	caseId?: Maybe<OrderBy>;
	refId?: Maybe<OrderBy>;
}

export enum CasesUpdateColumn {
	Action = 'action',
	ActionDuration = 'actionDuration',
	ActionProcessed = 'actionProcessed',
	CaseId = 'caseId',
	CreatedAt = 'createdAt',
	Guild = 'guild',
	Id = 'id',
	Message = 'message',
	ModId = 'modId',
	ModTag = 'modTag',
	MuteMessage = 'muteMessage',
	Reason = 'reason',
	RefId = 'refId',
	TargetId = 'targetId',
	TargetTag = 'targetTag',
}

export interface CasesVarPopFields {
	action?: Maybe<Scalars['Float']>;
	caseId?: Maybe<Scalars['Float']>;
	refId?: Maybe<Scalars['Float']>;
}

export interface CasesVarPopOrderBy {
	action?: Maybe<OrderBy>;
	caseId?: Maybe<OrderBy>;
	refId?: Maybe<OrderBy>;
}

export interface CasesVarSampFields {
	action?: Maybe<Scalars['Float']>;
	caseId?: Maybe<Scalars['Float']>;
	refId?: Maybe<Scalars['Float']>;
}

export interface CasesVarSampOrderBy {
	action?: Maybe<OrderBy>;
	caseId?: Maybe<OrderBy>;
	refId?: Maybe<OrderBy>;
}

export interface CasesVarianceFields {
	action?: Maybe<Scalars['Float']>;
	caseId?: Maybe<Scalars['Float']>;
	refId?: Maybe<Scalars['Float']>;
}

export interface CasesVarianceOrderBy {
	action?: Maybe<OrderBy>;
	caseId?: Maybe<OrderBy>;
	refId?: Maybe<OrderBy>;
}

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

export interface JsonbComparisonExp {
	_contained_in?: Maybe<Scalars['jsonb']>;
	_contains?: Maybe<Scalars['jsonb']>;
	_eq?: Maybe<Scalars['jsonb']>;
	_gt?: Maybe<Scalars['jsonb']>;
	_gte?: Maybe<Scalars['jsonb']>;
	_has_key?: Maybe<Scalars['String']>;
	_has_keys_all?: Maybe<Array<Scalars['String']>>;
	_has_keys_any?: Maybe<Array<Scalars['String']>>;
	_in?: Maybe<Array<Scalars['jsonb']>>;
	_is_null?: Maybe<Scalars['Boolean']>;
	_lt?: Maybe<Scalars['jsonb']>;
	_lte?: Maybe<Scalars['jsonb']>;
	_neq?: Maybe<Scalars['jsonb']>;
	_nin?: Maybe<Array<Scalars['jsonb']>>;
}

export interface Lockdowns {
	channel: Scalars['String'];
	duration: Scalars['timestamptz'];
	guild: Scalars['String'];
	id: Scalars['uuid'];
}

export interface LockdownsAggregate {
	aggregate?: Maybe<LockdownsAggregateFields>;
	nodes: Array<Lockdowns>;
}

export interface LockdownsAggregateFields {
	count?: Maybe<Scalars['Int']>;
	max?: Maybe<LockdownsMaxFields>;
	min?: Maybe<LockdownsMinFields>;
}

export interface LockdownsAggregateFieldsCountArgs {
	columns?: Maybe<Array<LockdownsSelectColumn>>;
	distinct?: Maybe<Scalars['Boolean']>;
}

export interface LockdownsAggregateOrderBy {
	count?: Maybe<OrderBy>;
	max?: Maybe<LockdownsMaxOrderBy>;
	min?: Maybe<LockdownsMinOrderBy>;
}

export interface LockdownsArrRelInsertInput {
	data: Array<LockdownsInsertInput>;
	on_conflict?: Maybe<LockdownsOnConflict>;
}

export interface LockdownsBoolExp {
	_and?: Maybe<Array<Maybe<LockdownsBoolExp>>>;
	_not?: Maybe<LockdownsBoolExp>;
	_or?: Maybe<Array<Maybe<LockdownsBoolExp>>>;
	channel?: Maybe<StringComparisonExp>;
	duration?: Maybe<TimestamptzComparisonExp>;
	guild?: Maybe<StringComparisonExp>;
	id?: Maybe<UuidComparisonExp>;
}

export enum LockdownsConstraint {
	LockdownsGuildChannelKey = 'lockdowns_guild_channel_key',
	LockdownsPkey = 'lockdowns_pkey',
}

export interface LockdownsInsertInput {
	channel?: Maybe<Scalars['String']>;
	duration?: Maybe<Scalars['timestamptz']>;
	guild?: Maybe<Scalars['String']>;
	id?: Maybe<Scalars['uuid']>;
}

export interface LockdownsMaxFields {
	channel?: Maybe<Scalars['String']>;
	duration?: Maybe<Scalars['timestamptz']>;
	guild?: Maybe<Scalars['String']>;
}

export interface LockdownsMaxOrderBy {
	channel?: Maybe<OrderBy>;
	duration?: Maybe<OrderBy>;
	guild?: Maybe<OrderBy>;
}

export interface LockdownsMinFields {
	channel?: Maybe<Scalars['String']>;
	duration?: Maybe<Scalars['timestamptz']>;
	guild?: Maybe<Scalars['String']>;
}

export interface LockdownsMinOrderBy {
	channel?: Maybe<OrderBy>;
	duration?: Maybe<OrderBy>;
	guild?: Maybe<OrderBy>;
}

export interface LockdownsMutationResponse {
	affected_rows: Scalars['Int'];
	returning: Array<Lockdowns>;
}

export interface LockdownsObjRelInsertInput {
	data: LockdownsInsertInput;
	on_conflict?: Maybe<LockdownsOnConflict>;
}

export interface LockdownsOnConflict {
	constraint: LockdownsConstraint;
	update_columns: Array<LockdownsUpdateColumn>;
	where?: Maybe<LockdownsBoolExp>;
}

export interface LockdownsOrderBy {
	channel?: Maybe<OrderBy>;
	duration?: Maybe<OrderBy>;
	guild?: Maybe<OrderBy>;
	id?: Maybe<OrderBy>;
}

export enum LockdownsSelectColumn {
	Channel = 'channel',
	Duration = 'duration',
	Guild = 'guild',
	Id = 'id',
}

export interface LockdownsSetInput {
	channel?: Maybe<Scalars['String']>;
	duration?: Maybe<Scalars['timestamptz']>;
	guild?: Maybe<Scalars['String']>;
	id?: Maybe<Scalars['uuid']>;
}

export enum LockdownsUpdateColumn {
	Channel = 'channel',
	Duration = 'duration',
	Guild = 'guild',
	Id = 'id',
}

export interface MutationRoot {
	deleteCases?: Maybe<CasesMutationResponse>;
	deleteCasesStaging?: Maybe<StagingCasesMutationResponse>;
	deleteLockdowns?: Maybe<LockdownsMutationResponse>;
	deleteLockdownsStaging?: Maybe<StagingLockdownsMutationResponse>;
	deleteRoleStates?: Maybe<RoleStatesMutationResponse>;
	deleteRoleStatesStaging?: Maybe<StagingRoleStatesMutationResponse>;
	deleteSettings?: Maybe<SettingsMutationResponse>;
	deleteSettingsStaging?: Maybe<StagingSettingsMutationResponse>;
	deleteTags?: Maybe<TagsMutationResponse>;
	deleteTagsStaging?: Maybe<StagingTagsMutationResponse>;
	insertCases?: Maybe<CasesMutationResponse>;
	insertCasesStaging?: Maybe<StagingCasesMutationResponse>;
	insertLockdowns?: Maybe<LockdownsMutationResponse>;
	insertLockdownsStaging?: Maybe<StagingLockdownsMutationResponse>;
	insertRoleStates?: Maybe<RoleStatesMutationResponse>;
	insertRoleStatesStaging?: Maybe<StagingRoleStatesMutationResponse>;
	insertSettings?: Maybe<SettingsMutationResponse>;
	insertSettingsStaging?: Maybe<StagingSettingsMutationResponse>;
	insertTags?: Maybe<TagsMutationResponse>;
	insertTagsStaging?: Maybe<StagingTagsMutationResponse>;
	updateCases?: Maybe<CasesMutationResponse>;
	updateCasesStaging?: Maybe<StagingCasesMutationResponse>;
	updateLockdowns?: Maybe<LockdownsMutationResponse>;
	updateLockdownsStaging?: Maybe<StagingLockdownsMutationResponse>;
	updateRoleStates?: Maybe<RoleStatesMutationResponse>;
	updateRoleStatesStaging?: Maybe<StagingRoleStatesMutationResponse>;
	updateSettings?: Maybe<SettingsMutationResponse>;
	updateSettingsStaging?: Maybe<StagingSettingsMutationResponse>;
	updateTags?: Maybe<TagsMutationResponse>;
	updateTagsStaging?: Maybe<StagingTagsMutationResponse>;
}

export interface MutationRootDeleteCasesArgs {
	where: CasesBoolExp;
}

export interface MutationRootDeleteCasesStagingArgs {
	where: StagingCasesBoolExp;
}

export interface MutationRootDeleteLockdownsArgs {
	where: LockdownsBoolExp;
}

export interface MutationRootDeleteLockdownsStagingArgs {
	where: StagingLockdownsBoolExp;
}

export interface MutationRootDeleteRoleStatesArgs {
	where: RoleStatesBoolExp;
}

export interface MutationRootDeleteRoleStatesStagingArgs {
	where: StagingRoleStatesBoolExp;
}

export interface MutationRootDeleteSettingsArgs {
	where: SettingsBoolExp;
}

export interface MutationRootDeleteSettingsStagingArgs {
	where: StagingSettingsBoolExp;
}

export interface MutationRootDeleteTagsArgs {
	where: TagsBoolExp;
}

export interface MutationRootDeleteTagsStagingArgs {
	where: StagingTagsBoolExp;
}

export interface MutationRootInsertCasesArgs {
	objects: Array<CasesInsertInput>;
	on_conflict?: Maybe<CasesOnConflict>;
}

export interface MutationRootInsertCasesStagingArgs {
	objects: Array<StagingCasesInsertInput>;
	on_conflict?: Maybe<StagingCasesOnConflict>;
}

export interface MutationRootInsertLockdownsArgs {
	objects: Array<LockdownsInsertInput>;
	on_conflict?: Maybe<LockdownsOnConflict>;
}

export interface MutationRootInsertLockdownsStagingArgs {
	objects: Array<StagingLockdownsInsertInput>;
	on_conflict?: Maybe<StagingLockdownsOnConflict>;
}

export interface MutationRootInsertRoleStatesArgs {
	objects: Array<RoleStatesInsertInput>;
	on_conflict?: Maybe<RoleStatesOnConflict>;
}

export interface MutationRootInsertRoleStatesStagingArgs {
	objects: Array<StagingRoleStatesInsertInput>;
	on_conflict?: Maybe<StagingRoleStatesOnConflict>;
}

export interface MutationRootInsertSettingsArgs {
	objects: Array<SettingsInsertInput>;
	on_conflict?: Maybe<SettingsOnConflict>;
}

export interface MutationRootInsertSettingsStagingArgs {
	objects: Array<StagingSettingsInsertInput>;
	on_conflict?: Maybe<StagingSettingsOnConflict>;
}

export interface MutationRootInsertTagsArgs {
	objects: Array<TagsInsertInput>;
	on_conflict?: Maybe<TagsOnConflict>;
}

export interface MutationRootInsertTagsStagingArgs {
	objects: Array<StagingTagsInsertInput>;
	on_conflict?: Maybe<StagingTagsOnConflict>;
}

export interface MutationRootUpdateCasesArgs {
	_inc?: Maybe<CasesIncInput>;
	_set?: Maybe<CasesSetInput>;
	where: CasesBoolExp;
}

export interface MutationRootUpdateCasesStagingArgs {
	_inc?: Maybe<StagingCasesIncInput>;
	_set?: Maybe<StagingCasesSetInput>;
	where: StagingCasesBoolExp;
}

export interface MutationRootUpdateLockdownsArgs {
	_set?: Maybe<LockdownsSetInput>;
	where: LockdownsBoolExp;
}

export interface MutationRootUpdateLockdownsStagingArgs {
	_set?: Maybe<StagingLockdownsSetInput>;
	where: StagingLockdownsBoolExp;
}

export interface MutationRootUpdateRoleStatesArgs {
	_set?: Maybe<RoleStatesSetInput>;
	where: RoleStatesBoolExp;
}

export interface MutationRootUpdateRoleStatesStagingArgs {
	_set?: Maybe<StagingRoleStatesSetInput>;
	where: StagingRoleStatesBoolExp;
}

export interface MutationRootUpdateSettingsArgs {
	_append?: Maybe<SettingsAppendInput>;
	_delete_at_path?: Maybe<SettingsDeleteAtPathInput>;
	_delete_elem?: Maybe<SettingsDeleteElemInput>;
	_delete_key?: Maybe<SettingsDeleteKeyInput>;
	_prepend?: Maybe<SettingsPrependInput>;
	_set?: Maybe<SettingsSetInput>;
	where: SettingsBoolExp;
}

export interface MutationRootUpdateSettingsStagingArgs {
	_append?: Maybe<StagingSettingsAppendInput>;
	_delete_at_path?: Maybe<StagingSettingsDeleteAtPathInput>;
	_delete_elem?: Maybe<StagingSettingsDeleteElemInput>;
	_delete_key?: Maybe<StagingSettingsDeleteKeyInput>;
	_prepend?: Maybe<StagingSettingsPrependInput>;
	_set?: Maybe<StagingSettingsSetInput>;
	where: StagingSettingsBoolExp;
}

export interface MutationRootUpdateTagsArgs {
	_inc?: Maybe<TagsIncInput>;
	_set?: Maybe<TagsSetInput>;
	where: TagsBoolExp;
}

export interface MutationRootUpdateTagsStagingArgs {
	_inc?: Maybe<StagingTagsIncInput>;
	_set?: Maybe<StagingTagsSetInput>;
	where: StagingTagsBoolExp;
}

export enum OrderBy {
	Asc = 'asc',
	AscNullsFirst = 'asc_nulls_first',
	AscNullsLast = 'asc_nulls_last',
	Desc = 'desc',
	DescNullsFirst = 'desc_nulls_first',
	DescNullsLast = 'desc_nulls_last',
}

export interface QueryRoot {
	cases: Array<Cases>;
	casesAggregate: CasesAggregate;
	casesAggregateStaging: StagingCasesAggregate;
	casesByPk?: Maybe<Cases>;
	casesByPkStaging?: Maybe<StagingCases>;
	casesStaging: Array<StagingCases>;
	lockdowns: Array<Lockdowns>;
	lockdownsAggregate: LockdownsAggregate;
	lockdownsAggregateStaging: StagingLockdownsAggregate;
	lockdownsByPk?: Maybe<Lockdowns>;
	lockdownsByPkStaging?: Maybe<StagingLockdowns>;
	lockdownsStaging: Array<StagingLockdowns>;
	roleStates: Array<RoleStates>;
	roleStatesAggregate: RoleStatesAggregate;
	roleStatesAggregateStaging: StagingRoleStatesAggregate;
	roleStatesByPk?: Maybe<RoleStates>;
	roleStatesByPkStaging?: Maybe<StagingRoleStates>;
	roleStatesStaging: Array<StagingRoleStates>;
	settings: Array<Settings>;
	settingsAggregate: SettingsAggregate;
	settingsAggregateStaging: StagingSettingsAggregate;
	settingsByPk?: Maybe<Settings>;
	settingsByPkStaging?: Maybe<StagingSettings>;
	settingsStaging: Array<StagingSettings>;
	tags: Array<Tags>;
	tagsAggregate: TagsAggregate;
	tagsAggregateStaging: StagingTagsAggregate;
	tagsByPk?: Maybe<Tags>;
	tagsByPkStaging?: Maybe<StagingTags>;
	tagsStaging: Array<StagingTags>;
}

export interface QueryRootCasesArgs {
	distinct_on?: Maybe<Array<CasesSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<CasesOrderBy>>;
	where?: Maybe<CasesBoolExp>;
}

export interface QueryRootCasesAggregateArgs {
	distinct_on?: Maybe<Array<CasesSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<CasesOrderBy>>;
	where?: Maybe<CasesBoolExp>;
}

export interface QueryRootCasesAggregateStagingArgs {
	distinct_on?: Maybe<Array<StagingCasesSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<StagingCasesOrderBy>>;
	where?: Maybe<StagingCasesBoolExp>;
}

export interface QueryRootCasesByPkArgs {
	id: Scalars['uuid'];
}

export interface QueryRootCasesByPkStagingArgs {
	id: Scalars['uuid'];
}

export interface QueryRootCasesStagingArgs {
	distinct_on?: Maybe<Array<StagingCasesSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<StagingCasesOrderBy>>;
	where?: Maybe<StagingCasesBoolExp>;
}

export interface QueryRootLockdownsArgs {
	distinct_on?: Maybe<Array<LockdownsSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<LockdownsOrderBy>>;
	where?: Maybe<LockdownsBoolExp>;
}

export interface QueryRootLockdownsAggregateArgs {
	distinct_on?: Maybe<Array<LockdownsSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<LockdownsOrderBy>>;
	where?: Maybe<LockdownsBoolExp>;
}

export interface QueryRootLockdownsAggregateStagingArgs {
	distinct_on?: Maybe<Array<StagingLockdownsSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<StagingLockdownsOrderBy>>;
	where?: Maybe<StagingLockdownsBoolExp>;
}

export interface QueryRootLockdownsByPkArgs {
	id: Scalars['uuid'];
}

export interface QueryRootLockdownsByPkStagingArgs {
	id: Scalars['uuid'];
}

export interface QueryRootLockdownsStagingArgs {
	distinct_on?: Maybe<Array<StagingLockdownsSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<StagingLockdownsOrderBy>>;
	where?: Maybe<StagingLockdownsBoolExp>;
}

export interface QueryRootRoleStatesArgs {
	distinct_on?: Maybe<Array<RoleStatesSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<RoleStatesOrderBy>>;
	where?: Maybe<RoleStatesBoolExp>;
}

export interface QueryRootRoleStatesAggregateArgs {
	distinct_on?: Maybe<Array<RoleStatesSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<RoleStatesOrderBy>>;
	where?: Maybe<RoleStatesBoolExp>;
}

export interface QueryRootRoleStatesAggregateStagingArgs {
	distinct_on?: Maybe<Array<StagingRoleStatesSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<StagingRoleStatesOrderBy>>;
	where?: Maybe<StagingRoleStatesBoolExp>;
}

export interface QueryRootRoleStatesByPkArgs {
	id: Scalars['uuid'];
}

export interface QueryRootRoleStatesByPkStagingArgs {
	id: Scalars['uuid'];
}

export interface QueryRootRoleStatesStagingArgs {
	distinct_on?: Maybe<Array<StagingRoleStatesSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<StagingRoleStatesOrderBy>>;
	where?: Maybe<StagingRoleStatesBoolExp>;
}

export interface QueryRootSettingsArgs {
	distinct_on?: Maybe<Array<SettingsSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<SettingsOrderBy>>;
	where?: Maybe<SettingsBoolExp>;
}

export interface QueryRootSettingsAggregateArgs {
	distinct_on?: Maybe<Array<SettingsSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<SettingsOrderBy>>;
	where?: Maybe<SettingsBoolExp>;
}

export interface QueryRootSettingsAggregateStagingArgs {
	distinct_on?: Maybe<Array<StagingSettingsSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<StagingSettingsOrderBy>>;
	where?: Maybe<StagingSettingsBoolExp>;
}

export interface QueryRootSettingsByPkArgs {
	guild: Scalars['String'];
}

export interface QueryRootSettingsByPkStagingArgs {
	guild: Scalars['String'];
}

export interface QueryRootSettingsStagingArgs {
	distinct_on?: Maybe<Array<StagingSettingsSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<StagingSettingsOrderBy>>;
	where?: Maybe<StagingSettingsBoolExp>;
}

export interface QueryRootTagsArgs {
	distinct_on?: Maybe<Array<TagsSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<TagsOrderBy>>;
	where?: Maybe<TagsBoolExp>;
}

export interface QueryRootTagsAggregateArgs {
	distinct_on?: Maybe<Array<TagsSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<TagsOrderBy>>;
	where?: Maybe<TagsBoolExp>;
}

export interface QueryRootTagsAggregateStagingArgs {
	distinct_on?: Maybe<Array<StagingTagsSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<StagingTagsOrderBy>>;
	where?: Maybe<StagingTagsBoolExp>;
}

export interface QueryRootTagsByPkArgs {
	id: Scalars['uuid'];
}

export interface QueryRootTagsByPkStagingArgs {
	id: Scalars['uuid'];
}

export interface QueryRootTagsStagingArgs {
	distinct_on?: Maybe<Array<StagingTagsSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<StagingTagsOrderBy>>;
	where?: Maybe<StagingTagsBoolExp>;
}

export interface RoleStates {
	guild: Scalars['String'];
	id: Scalars['uuid'];
	member: Scalars['String'];
	roles: Scalars['_text'];
}

export interface RoleStatesAggregate {
	aggregate?: Maybe<RoleStatesAggregateFields>;
	nodes: Array<RoleStates>;
}

export interface RoleStatesAggregateFields {
	count?: Maybe<Scalars['Int']>;
	max?: Maybe<RoleStatesMaxFields>;
	min?: Maybe<RoleStatesMinFields>;
}

export interface RoleStatesAggregateFieldsCountArgs {
	columns?: Maybe<Array<RoleStatesSelectColumn>>;
	distinct?: Maybe<Scalars['Boolean']>;
}

export interface RoleStatesAggregateOrderBy {
	count?: Maybe<OrderBy>;
	max?: Maybe<RoleStatesMaxOrderBy>;
	min?: Maybe<RoleStatesMinOrderBy>;
}

export interface RoleStatesArrRelInsertInput {
	data: Array<RoleStatesInsertInput>;
	on_conflict?: Maybe<RoleStatesOnConflict>;
}

export interface RoleStatesBoolExp {
	_and?: Maybe<Array<Maybe<RoleStatesBoolExp>>>;
	_not?: Maybe<RoleStatesBoolExp>;
	_or?: Maybe<Array<Maybe<RoleStatesBoolExp>>>;
	guild?: Maybe<StringComparisonExp>;
	id?: Maybe<UuidComparisonExp>;
	member?: Maybe<StringComparisonExp>;
	roles?: Maybe<TextComparisonExp>;
}

export enum RoleStatesConstraint {
	RoleStatesGuildMemberKey = 'role_states_guild_member_key',
	RoleStatesPkey = 'role_states_pkey',
}

export interface RoleStatesInsertInput {
	guild?: Maybe<Scalars['String']>;
	id?: Maybe<Scalars['uuid']>;
	member?: Maybe<Scalars['String']>;
	roles?: Maybe<Scalars['_text']>;
}

export interface RoleStatesMaxFields {
	guild?: Maybe<Scalars['String']>;
	member?: Maybe<Scalars['String']>;
}

export interface RoleStatesMaxOrderBy {
	guild?: Maybe<OrderBy>;
	member?: Maybe<OrderBy>;
}

export interface RoleStatesMinFields {
	guild?: Maybe<Scalars['String']>;
	member?: Maybe<Scalars['String']>;
}

export interface RoleStatesMinOrderBy {
	guild?: Maybe<OrderBy>;
	member?: Maybe<OrderBy>;
}

export interface RoleStatesMutationResponse {
	affected_rows: Scalars['Int'];
	returning: Array<RoleStates>;
}

export interface RoleStatesObjRelInsertInput {
	data: RoleStatesInsertInput;
	on_conflict?: Maybe<RoleStatesOnConflict>;
}

export interface RoleStatesOnConflict {
	constraint: RoleStatesConstraint;
	update_columns: Array<RoleStatesUpdateColumn>;
	where?: Maybe<RoleStatesBoolExp>;
}

export interface RoleStatesOrderBy {
	guild?: Maybe<OrderBy>;
	id?: Maybe<OrderBy>;
	member?: Maybe<OrderBy>;
	roles?: Maybe<OrderBy>;
}

export enum RoleStatesSelectColumn {
	Guild = 'guild',
	Id = 'id',
	Member = 'member',
	Roles = 'roles',
}

export interface RoleStatesSetInput {
	guild?: Maybe<Scalars['String']>;
	id?: Maybe<Scalars['uuid']>;
	member?: Maybe<Scalars['String']>;
	roles?: Maybe<Scalars['_text']>;
}

export enum RoleStatesUpdateColumn {
	Guild = 'guild',
	Id = 'id',
	Member = 'member',
	Roles = 'roles',
}

export interface Settings {
	guild: Scalars['String'];
	settings: Scalars['jsonb'];
}

export interface SettingsSettingsArgs {
	path?: Maybe<Scalars['String']>;
}

export interface SettingsAggregate {
	aggregate?: Maybe<SettingsAggregateFields>;
	nodes: Array<Settings>;
}

export interface SettingsAggregateFields {
	count?: Maybe<Scalars['Int']>;
	max?: Maybe<SettingsMaxFields>;
	min?: Maybe<SettingsMinFields>;
}

export interface SettingsAggregateFieldsCountArgs {
	columns?: Maybe<Array<SettingsSelectColumn>>;
	distinct?: Maybe<Scalars['Boolean']>;
}

export interface SettingsAggregateOrderBy {
	count?: Maybe<OrderBy>;
	max?: Maybe<SettingsMaxOrderBy>;
	min?: Maybe<SettingsMinOrderBy>;
}

export interface SettingsAppendInput {
	settings?: Maybe<Scalars['jsonb']>;
}

export interface SettingsArrRelInsertInput {
	data: Array<SettingsInsertInput>;
	on_conflict?: Maybe<SettingsOnConflict>;
}

export interface SettingsBoolExp {
	_and?: Maybe<Array<Maybe<SettingsBoolExp>>>;
	_not?: Maybe<SettingsBoolExp>;
	_or?: Maybe<Array<Maybe<SettingsBoolExp>>>;
	guild?: Maybe<StringComparisonExp>;
	settings?: Maybe<JsonbComparisonExp>;
}

export enum SettingsConstraint {
	SettingsGuildKey = 'settings_guild_key',
	SettingsPkey = 'settings_pkey',
}

export interface SettingsDeleteAtPathInput {
	settings?: Maybe<Array<Maybe<Scalars['String']>>>;
}

export interface SettingsDeleteElemInput {
	settings?: Maybe<Scalars['Int']>;
}

export interface SettingsDeleteKeyInput {
	settings?: Maybe<Scalars['String']>;
}

export interface SettingsInsertInput {
	guild?: Maybe<Scalars['String']>;
	settings?: Maybe<Scalars['jsonb']>;
}

export interface SettingsMaxFields {
	guild?: Maybe<Scalars['String']>;
}

export interface SettingsMaxOrderBy {
	guild?: Maybe<OrderBy>;
}

export interface SettingsMinFields {
	guild?: Maybe<Scalars['String']>;
}

export interface SettingsMinOrderBy {
	guild?: Maybe<OrderBy>;
}

export interface SettingsMutationResponse {
	affected_rows: Scalars['Int'];
	returning: Array<Settings>;
}

export interface SettingsObjRelInsertInput {
	data: SettingsInsertInput;
	on_conflict?: Maybe<SettingsOnConflict>;
}

export interface SettingsOnConflict {
	constraint: SettingsConstraint;
	update_columns: Array<SettingsUpdateColumn>;
	where?: Maybe<SettingsBoolExp>;
}

export interface SettingsOrderBy {
	guild?: Maybe<OrderBy>;
	settings?: Maybe<OrderBy>;
}

export interface SettingsPrependInput {
	settings?: Maybe<Scalars['jsonb']>;
}

export enum SettingsSelectColumn {
	Guild = 'guild',
	Settings = 'settings',
}

export interface SettingsSetInput {
	guild?: Maybe<Scalars['String']>;
	settings?: Maybe<Scalars['jsonb']>;
}

export enum SettingsUpdateColumn {
	Guild = 'guild',
	Settings = 'settings',
}

export interface StagingCases {
	action: Scalars['Int'];
	actionDuration?: Maybe<Scalars['timestamptz']>;
	actionProcessed?: Maybe<Scalars['Boolean']>;
	caseId: Scalars['Int'];
	createdAt: Scalars['timestamptz'];
	guild: Scalars['String'];
	id: Scalars['uuid'];
	message?: Maybe<Scalars['String']>;
	modId?: Maybe<Scalars['String']>;
	modTag?: Maybe<Scalars['String']>;
	mute_message?: Maybe<Scalars['String']>;
	reason?: Maybe<Scalars['String']>;
	refId?: Maybe<Scalars['Int']>;
	targetId: Scalars['String'];
	targetTag: Scalars['String'];
}

export interface StagingCasesAggregate {
	aggregate?: Maybe<StagingCasesAggregateFields>;
	nodes: Array<StagingCases>;
}

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

export interface StagingCasesAggregateFieldsCountArgs {
	columns?: Maybe<Array<StagingCasesSelectColumn>>;
	distinct?: Maybe<Scalars['Boolean']>;
}

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

export interface StagingCasesArrRelInsertInput {
	data: Array<StagingCasesInsertInput>;
	on_conflict?: Maybe<StagingCasesOnConflict>;
}

export interface StagingCasesAvgFields {
	action?: Maybe<Scalars['Float']>;
	caseId?: Maybe<Scalars['Float']>;
	refId?: Maybe<Scalars['Float']>;
}

export interface StagingCasesAvgOrderBy {
	action?: Maybe<OrderBy>;
	caseId?: Maybe<OrderBy>;
	refId?: Maybe<OrderBy>;
}

export interface StagingCasesBoolExp {
	_and?: Maybe<Array<Maybe<StagingCasesBoolExp>>>;
	_not?: Maybe<StagingCasesBoolExp>;
	_or?: Maybe<Array<Maybe<StagingCasesBoolExp>>>;
	action?: Maybe<IntComparisonExp>;
	actionDuration?: Maybe<TimestamptzComparisonExp>;
	actionProcessed?: Maybe<BooleanComparisonExp>;
	caseId?: Maybe<IntComparisonExp>;
	createdAt?: Maybe<TimestamptzComparisonExp>;
	guild?: Maybe<StringComparisonExp>;
	id?: Maybe<UuidComparisonExp>;
	message?: Maybe<StringComparisonExp>;
	modId?: Maybe<StringComparisonExp>;
	modTag?: Maybe<StringComparisonExp>;
	mute_message?: Maybe<StringComparisonExp>;
	reason?: Maybe<StringComparisonExp>;
	refId?: Maybe<IntComparisonExp>;
	targetId?: Maybe<StringComparisonExp>;
	targetTag?: Maybe<StringComparisonExp>;
}

export enum StagingCasesConstraint {
	CasesPkey = 'cases_pkey',
}

export interface StagingCasesIncInput {
	action?: Maybe<Scalars['Int']>;
	caseId?: Maybe<Scalars['Int']>;
	refId?: Maybe<Scalars['Int']>;
}

export interface StagingCasesInsertInput {
	action?: Maybe<Scalars['Int']>;
	actionDuration?: Maybe<Scalars['timestamptz']>;
	actionProcessed?: Maybe<Scalars['Boolean']>;
	caseId?: Maybe<Scalars['Int']>;
	createdAt?: Maybe<Scalars['timestamptz']>;
	guild?: Maybe<Scalars['String']>;
	id?: Maybe<Scalars['uuid']>;
	message?: Maybe<Scalars['String']>;
	modId?: Maybe<Scalars['String']>;
	modTag?: Maybe<Scalars['String']>;
	mute_message?: Maybe<Scalars['String']>;
	reason?: Maybe<Scalars['String']>;
	refId?: Maybe<Scalars['Int']>;
	targetId?: Maybe<Scalars['String']>;
	targetTag?: Maybe<Scalars['String']>;
}

export interface StagingCasesMaxFields {
	action?: Maybe<Scalars['Int']>;
	actionDuration?: Maybe<Scalars['timestamptz']>;
	caseId?: Maybe<Scalars['Int']>;
	createdAt?: Maybe<Scalars['timestamptz']>;
	guild?: Maybe<Scalars['String']>;
	message?: Maybe<Scalars['String']>;
	modId?: Maybe<Scalars['String']>;
	modTag?: Maybe<Scalars['String']>;
	mute_message?: Maybe<Scalars['String']>;
	reason?: Maybe<Scalars['String']>;
	refId?: Maybe<Scalars['Int']>;
	targetId?: Maybe<Scalars['String']>;
	targetTag?: Maybe<Scalars['String']>;
}

export interface StagingCasesMaxOrderBy {
	action?: Maybe<OrderBy>;
	actionDuration?: Maybe<OrderBy>;
	caseId?: Maybe<OrderBy>;
	createdAt?: Maybe<OrderBy>;
	guild?: Maybe<OrderBy>;
	message?: Maybe<OrderBy>;
	modId?: Maybe<OrderBy>;
	modTag?: Maybe<OrderBy>;
	mute_message?: Maybe<OrderBy>;
	reason?: Maybe<OrderBy>;
	refId?: Maybe<OrderBy>;
	targetId?: Maybe<OrderBy>;
	targetTag?: Maybe<OrderBy>;
}

export interface StagingCasesMinFields {
	action?: Maybe<Scalars['Int']>;
	actionDuration?: Maybe<Scalars['timestamptz']>;
	caseId?: Maybe<Scalars['Int']>;
	createdAt?: Maybe<Scalars['timestamptz']>;
	guild?: Maybe<Scalars['String']>;
	message?: Maybe<Scalars['String']>;
	modId?: Maybe<Scalars['String']>;
	modTag?: Maybe<Scalars['String']>;
	mute_message?: Maybe<Scalars['String']>;
	reason?: Maybe<Scalars['String']>;
	refId?: Maybe<Scalars['Int']>;
	targetId?: Maybe<Scalars['String']>;
	targetTag?: Maybe<Scalars['String']>;
}

export interface StagingCasesMinOrderBy {
	action?: Maybe<OrderBy>;
	actionDuration?: Maybe<OrderBy>;
	caseId?: Maybe<OrderBy>;
	createdAt?: Maybe<OrderBy>;
	guild?: Maybe<OrderBy>;
	message?: Maybe<OrderBy>;
	modId?: Maybe<OrderBy>;
	modTag?: Maybe<OrderBy>;
	mute_message?: Maybe<OrderBy>;
	reason?: Maybe<OrderBy>;
	refId?: Maybe<OrderBy>;
	targetId?: Maybe<OrderBy>;
	targetTag?: Maybe<OrderBy>;
}

export interface StagingCasesMutationResponse {
	affected_rows: Scalars['Int'];
	returning: Array<StagingCases>;
}

export interface StagingCasesObjRelInsertInput {
	data: StagingCasesInsertInput;
	on_conflict?: Maybe<StagingCasesOnConflict>;
}

export interface StagingCasesOnConflict {
	constraint: StagingCasesConstraint;
	update_columns: Array<StagingCasesUpdateColumn>;
	where?: Maybe<StagingCasesBoolExp>;
}

export interface StagingCasesOrderBy {
	action?: Maybe<OrderBy>;
	actionDuration?: Maybe<OrderBy>;
	actionProcessed?: Maybe<OrderBy>;
	caseId?: Maybe<OrderBy>;
	createdAt?: Maybe<OrderBy>;
	guild?: Maybe<OrderBy>;
	id?: Maybe<OrderBy>;
	message?: Maybe<OrderBy>;
	modId?: Maybe<OrderBy>;
	modTag?: Maybe<OrderBy>;
	mute_message?: Maybe<OrderBy>;
	reason?: Maybe<OrderBy>;
	refId?: Maybe<OrderBy>;
	targetId?: Maybe<OrderBy>;
	targetTag?: Maybe<OrderBy>;
}

export enum StagingCasesSelectColumn {
	Action = 'action',
	ActionDuration = 'actionDuration',
	ActionProcessed = 'actionProcessed',
	CaseId = 'caseId',
	CreatedAt = 'createdAt',
	Guild = 'guild',
	Id = 'id',
	Message = 'message',
	ModId = 'modId',
	ModTag = 'modTag',
	MuteMessage = 'mute_message',
	Reason = 'reason',
	RefId = 'refId',
	TargetId = 'targetId',
	TargetTag = 'targetTag',
}

export interface StagingCasesSetInput {
	action?: Maybe<Scalars['Int']>;
	actionDuration?: Maybe<Scalars['timestamptz']>;
	actionProcessed?: Maybe<Scalars['Boolean']>;
	caseId?: Maybe<Scalars['Int']>;
	createdAt?: Maybe<Scalars['timestamptz']>;
	guild?: Maybe<Scalars['String']>;
	id?: Maybe<Scalars['uuid']>;
	message?: Maybe<Scalars['String']>;
	modId?: Maybe<Scalars['String']>;
	modTag?: Maybe<Scalars['String']>;
	mute_message?: Maybe<Scalars['String']>;
	reason?: Maybe<Scalars['String']>;
	refId?: Maybe<Scalars['Int']>;
	targetId?: Maybe<Scalars['String']>;
	targetTag?: Maybe<Scalars['String']>;
}

export interface StagingCasesStddevFields {
	action?: Maybe<Scalars['Float']>;
	caseId?: Maybe<Scalars['Float']>;
	refId?: Maybe<Scalars['Float']>;
}

export interface StagingCasesStddevOrderBy {
	action?: Maybe<OrderBy>;
	caseId?: Maybe<OrderBy>;
	refId?: Maybe<OrderBy>;
}

export interface StagingCasesStddevPopFields {
	action?: Maybe<Scalars['Float']>;
	caseId?: Maybe<Scalars['Float']>;
	refId?: Maybe<Scalars['Float']>;
}

export interface StagingCasesStddevPopOrderBy {
	action?: Maybe<OrderBy>;
	caseId?: Maybe<OrderBy>;
	refId?: Maybe<OrderBy>;
}

export interface StagingCasesStddevSampFields {
	action?: Maybe<Scalars['Float']>;
	caseId?: Maybe<Scalars['Float']>;
	refId?: Maybe<Scalars['Float']>;
}

export interface StagingCasesStddevSampOrderBy {
	action?: Maybe<OrderBy>;
	caseId?: Maybe<OrderBy>;
	refId?: Maybe<OrderBy>;
}

export interface StagingCasesSumFields {
	action?: Maybe<Scalars['Int']>;
	caseId?: Maybe<Scalars['Int']>;
	refId?: Maybe<Scalars['Int']>;
}

export interface StagingCasesSumOrderBy {
	action?: Maybe<OrderBy>;
	caseId?: Maybe<OrderBy>;
	refId?: Maybe<OrderBy>;
}

export enum StagingCasesUpdateColumn {
	Action = 'action',
	ActionDuration = 'actionDuration',
	ActionProcessed = 'actionProcessed',
	CaseId = 'caseId',
	CreatedAt = 'createdAt',
	Guild = 'guild',
	Id = 'id',
	Message = 'message',
	ModId = 'modId',
	ModTag = 'modTag',
	MuteMessage = 'mute_message',
	Reason = 'reason',
	RefId = 'refId',
	TargetId = 'targetId',
	TargetTag = 'targetTag',
}

export interface StagingCasesVarPopFields {
	action?: Maybe<Scalars['Float']>;
	caseId?: Maybe<Scalars['Float']>;
	refId?: Maybe<Scalars['Float']>;
}

export interface StagingCasesVarPopOrderBy {
	action?: Maybe<OrderBy>;
	caseId?: Maybe<OrderBy>;
	refId?: Maybe<OrderBy>;
}

export interface StagingCasesVarSampFields {
	action?: Maybe<Scalars['Float']>;
	caseId?: Maybe<Scalars['Float']>;
	refId?: Maybe<Scalars['Float']>;
}

export interface StagingCasesVarSampOrderBy {
	action?: Maybe<OrderBy>;
	caseId?: Maybe<OrderBy>;
	refId?: Maybe<OrderBy>;
}

export interface StagingCasesVarianceFields {
	action?: Maybe<Scalars['Float']>;
	caseId?: Maybe<Scalars['Float']>;
	refId?: Maybe<Scalars['Float']>;
}

export interface StagingCasesVarianceOrderBy {
	action?: Maybe<OrderBy>;
	caseId?: Maybe<OrderBy>;
	refId?: Maybe<OrderBy>;
}

export interface StagingLockdowns {
	channel: Scalars['String'];
	duration: Scalars['timestamptz'];
	guild: Scalars['String'];
	id: Scalars['uuid'];
}

export interface StagingLockdownsAggregate {
	aggregate?: Maybe<StagingLockdownsAggregateFields>;
	nodes: Array<StagingLockdowns>;
}

export interface StagingLockdownsAggregateFields {
	count?: Maybe<Scalars['Int']>;
	max?: Maybe<StagingLockdownsMaxFields>;
	min?: Maybe<StagingLockdownsMinFields>;
}

export interface StagingLockdownsAggregateFieldsCountArgs {
	columns?: Maybe<Array<StagingLockdownsSelectColumn>>;
	distinct?: Maybe<Scalars['Boolean']>;
}

export interface StagingLockdownsAggregateOrderBy {
	count?: Maybe<OrderBy>;
	max?: Maybe<StagingLockdownsMaxOrderBy>;
	min?: Maybe<StagingLockdownsMinOrderBy>;
}

export interface StagingLockdownsArrRelInsertInput {
	data: Array<StagingLockdownsInsertInput>;
	on_conflict?: Maybe<StagingLockdownsOnConflict>;
}

export interface StagingLockdownsBoolExp {
	_and?: Maybe<Array<Maybe<StagingLockdownsBoolExp>>>;
	_not?: Maybe<StagingLockdownsBoolExp>;
	_or?: Maybe<Array<Maybe<StagingLockdownsBoolExp>>>;
	channel?: Maybe<StringComparisonExp>;
	duration?: Maybe<TimestamptzComparisonExp>;
	guild?: Maybe<StringComparisonExp>;
	id?: Maybe<UuidComparisonExp>;
}

export enum StagingLockdownsConstraint {
	LockdownsGuildChannelKey = 'lockdowns_guild_channel_key',
	LockdownsPkey = 'lockdowns_pkey',
}

export interface StagingLockdownsInsertInput {
	channel?: Maybe<Scalars['String']>;
	duration?: Maybe<Scalars['timestamptz']>;
	guild?: Maybe<Scalars['String']>;
	id?: Maybe<Scalars['uuid']>;
}

export interface StagingLockdownsMaxFields {
	channel?: Maybe<Scalars['String']>;
	duration?: Maybe<Scalars['timestamptz']>;
	guild?: Maybe<Scalars['String']>;
}

export interface StagingLockdownsMaxOrderBy {
	channel?: Maybe<OrderBy>;
	duration?: Maybe<OrderBy>;
	guild?: Maybe<OrderBy>;
}

export interface StagingLockdownsMinFields {
	channel?: Maybe<Scalars['String']>;
	duration?: Maybe<Scalars['timestamptz']>;
	guild?: Maybe<Scalars['String']>;
}

export interface StagingLockdownsMinOrderBy {
	channel?: Maybe<OrderBy>;
	duration?: Maybe<OrderBy>;
	guild?: Maybe<OrderBy>;
}

export interface StagingLockdownsMutationResponse {
	affected_rows: Scalars['Int'];
	returning: Array<StagingLockdowns>;
}

export interface StagingLockdownsObjRelInsertInput {
	data: StagingLockdownsInsertInput;
	on_conflict?: Maybe<StagingLockdownsOnConflict>;
}

export interface StagingLockdownsOnConflict {
	constraint: StagingLockdownsConstraint;
	update_columns: Array<StagingLockdownsUpdateColumn>;
	where?: Maybe<StagingLockdownsBoolExp>;
}

export interface StagingLockdownsOrderBy {
	channel?: Maybe<OrderBy>;
	duration?: Maybe<OrderBy>;
	guild?: Maybe<OrderBy>;
	id?: Maybe<OrderBy>;
}

export enum StagingLockdownsSelectColumn {
	Channel = 'channel',
	Duration = 'duration',
	Guild = 'guild',
	Id = 'id',
}

export interface StagingLockdownsSetInput {
	channel?: Maybe<Scalars['String']>;
	duration?: Maybe<Scalars['timestamptz']>;
	guild?: Maybe<Scalars['String']>;
	id?: Maybe<Scalars['uuid']>;
}

export enum StagingLockdownsUpdateColumn {
	Channel = 'channel',
	Duration = 'duration',
	Guild = 'guild',
	Id = 'id',
}

export interface StagingRoleStates {
	guild: Scalars['String'];
	id: Scalars['uuid'];
	member: Scalars['String'];
	roles: Scalars['_text'];
}

export interface StagingRoleStatesAggregate {
	aggregate?: Maybe<StagingRoleStatesAggregateFields>;
	nodes: Array<StagingRoleStates>;
}

export interface StagingRoleStatesAggregateFields {
	count?: Maybe<Scalars['Int']>;
	max?: Maybe<StagingRoleStatesMaxFields>;
	min?: Maybe<StagingRoleStatesMinFields>;
}

export interface StagingRoleStatesAggregateFieldsCountArgs {
	columns?: Maybe<Array<StagingRoleStatesSelectColumn>>;
	distinct?: Maybe<Scalars['Boolean']>;
}

export interface StagingRoleStatesAggregateOrderBy {
	count?: Maybe<OrderBy>;
	max?: Maybe<StagingRoleStatesMaxOrderBy>;
	min?: Maybe<StagingRoleStatesMinOrderBy>;
}

export interface StagingRoleStatesArrRelInsertInput {
	data: Array<StagingRoleStatesInsertInput>;
	on_conflict?: Maybe<StagingRoleStatesOnConflict>;
}

export interface StagingRoleStatesBoolExp {
	_and?: Maybe<Array<Maybe<StagingRoleStatesBoolExp>>>;
	_not?: Maybe<StagingRoleStatesBoolExp>;
	_or?: Maybe<Array<Maybe<StagingRoleStatesBoolExp>>>;
	guild?: Maybe<StringComparisonExp>;
	id?: Maybe<UuidComparisonExp>;
	member?: Maybe<StringComparisonExp>;
	roles?: Maybe<TextComparisonExp>;
}

export enum StagingRoleStatesConstraint {
	RoleStatesGuildMemberKey = 'role_states_guild_member_key',
	RoleStatesPkey = 'role_states_pkey',
}

export interface StagingRoleStatesInsertInput {
	guild?: Maybe<Scalars['String']>;
	id?: Maybe<Scalars['uuid']>;
	member?: Maybe<Scalars['String']>;
	roles?: Maybe<Scalars['_text']>;
}

export interface StagingRoleStatesMaxFields {
	guild?: Maybe<Scalars['String']>;
	member?: Maybe<Scalars['String']>;
}

export interface StagingRoleStatesMaxOrderBy {
	guild?: Maybe<OrderBy>;
	member?: Maybe<OrderBy>;
}

export interface StagingRoleStatesMinFields {
	guild?: Maybe<Scalars['String']>;
	member?: Maybe<Scalars['String']>;
}

export interface StagingRoleStatesMinOrderBy {
	guild?: Maybe<OrderBy>;
	member?: Maybe<OrderBy>;
}

export interface StagingRoleStatesMutationResponse {
	affected_rows: Scalars['Int'];
	returning: Array<StagingRoleStates>;
}

export interface StagingRoleStatesObjRelInsertInput {
	data: StagingRoleStatesInsertInput;
	on_conflict?: Maybe<StagingRoleStatesOnConflict>;
}

export interface StagingRoleStatesOnConflict {
	constraint: StagingRoleStatesConstraint;
	update_columns: Array<StagingRoleStatesUpdateColumn>;
	where?: Maybe<StagingRoleStatesBoolExp>;
}

export interface StagingRoleStatesOrderBy {
	guild?: Maybe<OrderBy>;
	id?: Maybe<OrderBy>;
	member?: Maybe<OrderBy>;
	roles?: Maybe<OrderBy>;
}

export enum StagingRoleStatesSelectColumn {
	Guild = 'guild',
	Id = 'id',
	Member = 'member',
	Roles = 'roles',
}

export interface StagingRoleStatesSetInput {
	guild?: Maybe<Scalars['String']>;
	id?: Maybe<Scalars['uuid']>;
	member?: Maybe<Scalars['String']>;
	roles?: Maybe<Scalars['_text']>;
}

export enum StagingRoleStatesUpdateColumn {
	Guild = 'guild',
	Id = 'id',
	Member = 'member',
	Roles = 'roles',
}

export interface StagingSettings {
	guild: Scalars['String'];
	settings: Scalars['jsonb'];
}

export interface StagingSettingsSettingsArgs {
	path?: Maybe<Scalars['String']>;
}

export interface StagingSettingsAggregate {
	aggregate?: Maybe<StagingSettingsAggregateFields>;
	nodes: Array<StagingSettings>;
}

export interface StagingSettingsAggregateFields {
	count?: Maybe<Scalars['Int']>;
	max?: Maybe<StagingSettingsMaxFields>;
	min?: Maybe<StagingSettingsMinFields>;
}

export interface StagingSettingsAggregateFieldsCountArgs {
	columns?: Maybe<Array<StagingSettingsSelectColumn>>;
	distinct?: Maybe<Scalars['Boolean']>;
}

export interface StagingSettingsAggregateOrderBy {
	count?: Maybe<OrderBy>;
	max?: Maybe<StagingSettingsMaxOrderBy>;
	min?: Maybe<StagingSettingsMinOrderBy>;
}

export interface StagingSettingsAppendInput {
	settings?: Maybe<Scalars['jsonb']>;
}

export interface StagingSettingsArrRelInsertInput {
	data: Array<StagingSettingsInsertInput>;
	on_conflict?: Maybe<StagingSettingsOnConflict>;
}

export interface StagingSettingsBoolExp {
	_and?: Maybe<Array<Maybe<StagingSettingsBoolExp>>>;
	_not?: Maybe<StagingSettingsBoolExp>;
	_or?: Maybe<Array<Maybe<StagingSettingsBoolExp>>>;
	guild?: Maybe<StringComparisonExp>;
	settings?: Maybe<JsonbComparisonExp>;
}

export enum StagingSettingsConstraint {
	SettingsPkey = 'settings_pkey',
}

export interface StagingSettingsDeleteAtPathInput {
	settings?: Maybe<Array<Maybe<Scalars['String']>>>;
}

export interface StagingSettingsDeleteElemInput {
	settings?: Maybe<Scalars['Int']>;
}

export interface StagingSettingsDeleteKeyInput {
	settings?: Maybe<Scalars['String']>;
}

export interface StagingSettingsInsertInput {
	guild?: Maybe<Scalars['String']>;
	settings?: Maybe<Scalars['jsonb']>;
}

export interface StagingSettingsMaxFields {
	guild?: Maybe<Scalars['String']>;
}

export interface StagingSettingsMaxOrderBy {
	guild?: Maybe<OrderBy>;
}

export interface StagingSettingsMinFields {
	guild?: Maybe<Scalars['String']>;
}

export interface StagingSettingsMinOrderBy {
	guild?: Maybe<OrderBy>;
}

export interface StagingSettingsMutationResponse {
	affected_rows: Scalars['Int'];
	returning: Array<StagingSettings>;
}

export interface StagingSettingsObjRelInsertInput {
	data: StagingSettingsInsertInput;
	on_conflict?: Maybe<StagingSettingsOnConflict>;
}

export interface StagingSettingsOnConflict {
	constraint: StagingSettingsConstraint;
	update_columns: Array<StagingSettingsUpdateColumn>;
	where?: Maybe<StagingSettingsBoolExp>;
}

export interface StagingSettingsOrderBy {
	guild?: Maybe<OrderBy>;
	settings?: Maybe<OrderBy>;
}

export interface StagingSettingsPrependInput {
	settings?: Maybe<Scalars['jsonb']>;
}

export enum StagingSettingsSelectColumn {
	Guild = 'guild',
	Settings = 'settings',
}

export interface StagingSettingsSetInput {
	guild?: Maybe<Scalars['String']>;
	settings?: Maybe<Scalars['jsonb']>;
}

export enum StagingSettingsUpdateColumn {
	Guild = 'guild',
	Settings = 'settings',
}

export interface StagingTags {
	aliases: Scalars['_text'];
	content: Scalars['String'];
	createdAt: Scalars['timestamptz'];
	guild: Scalars['String'];
	hoisted?: Maybe<Scalars['Boolean']>;
	id: Scalars['uuid'];
	lastModified?: Maybe<Scalars['String']>;
	name: Scalars['String'];
	templated: Scalars['Boolean'];
	updatedAt: Scalars['timestamptz'];
	user: Scalars['String'];
	uses: Scalars['Int'];
}

export interface StagingTagsAggregate {
	aggregate?: Maybe<StagingTagsAggregateFields>;
	nodes: Array<StagingTags>;
}

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

export interface StagingTagsAggregateFieldsCountArgs {
	columns?: Maybe<Array<StagingTagsSelectColumn>>;
	distinct?: Maybe<Scalars['Boolean']>;
}

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

export interface StagingTagsArrRelInsertInput {
	data: Array<StagingTagsInsertInput>;
	on_conflict?: Maybe<StagingTagsOnConflict>;
}

export interface StagingTagsAvgFields {
	uses?: Maybe<Scalars['Float']>;
}

export interface StagingTagsAvgOrderBy {
	uses?: Maybe<OrderBy>;
}

export interface StagingTagsBoolExp {
	_and?: Maybe<Array<Maybe<StagingTagsBoolExp>>>;
	_not?: Maybe<StagingTagsBoolExp>;
	_or?: Maybe<Array<Maybe<StagingTagsBoolExp>>>;
	aliases?: Maybe<TextComparisonExp>;
	content?: Maybe<StringComparisonExp>;
	createdAt?: Maybe<TimestamptzComparisonExp>;
	guild?: Maybe<StringComparisonExp>;
	hoisted?: Maybe<BooleanComparisonExp>;
	id?: Maybe<UuidComparisonExp>;
	lastModified?: Maybe<StringComparisonExp>;
	name?: Maybe<StringComparisonExp>;
	templated?: Maybe<BooleanComparisonExp>;
	updatedAt?: Maybe<TimestamptzComparisonExp>;
	user?: Maybe<StringComparisonExp>;
	uses?: Maybe<IntComparisonExp>;
}

export enum StagingTagsConstraint {
	TagsGuildNameKey = 'tags_guild_name_key',
	TagsPkey = 'tags_pkey',
}

export interface StagingTagsIncInput {
	uses?: Maybe<Scalars['Int']>;
}

export interface StagingTagsInsertInput {
	aliases?: Maybe<Scalars['_text']>;
	content?: Maybe<Scalars['String']>;
	createdAt?: Maybe<Scalars['timestamptz']>;
	guild?: Maybe<Scalars['String']>;
	hoisted?: Maybe<Scalars['Boolean']>;
	id?: Maybe<Scalars['uuid']>;
	lastModified?: Maybe<Scalars['String']>;
	name?: Maybe<Scalars['String']>;
	templated?: Maybe<Scalars['Boolean']>;
	updatedAt?: Maybe<Scalars['timestamptz']>;
	user?: Maybe<Scalars['String']>;
	uses?: Maybe<Scalars['Int']>;
}

export interface StagingTagsMaxFields {
	content?: Maybe<Scalars['String']>;
	createdAt?: Maybe<Scalars['timestamptz']>;
	guild?: Maybe<Scalars['String']>;
	lastModified?: Maybe<Scalars['String']>;
	name?: Maybe<Scalars['String']>;
	updatedAt?: Maybe<Scalars['timestamptz']>;
	user?: Maybe<Scalars['String']>;
	uses?: Maybe<Scalars['Int']>;
}

export interface StagingTagsMaxOrderBy {
	content?: Maybe<OrderBy>;
	createdAt?: Maybe<OrderBy>;
	guild?: Maybe<OrderBy>;
	lastModified?: Maybe<OrderBy>;
	name?: Maybe<OrderBy>;
	updatedAt?: Maybe<OrderBy>;
	user?: Maybe<OrderBy>;
	uses?: Maybe<OrderBy>;
}

export interface StagingTagsMinFields {
	content?: Maybe<Scalars['String']>;
	createdAt?: Maybe<Scalars['timestamptz']>;
	guild?: Maybe<Scalars['String']>;
	lastModified?: Maybe<Scalars['String']>;
	name?: Maybe<Scalars['String']>;
	updatedAt?: Maybe<Scalars['timestamptz']>;
	user?: Maybe<Scalars['String']>;
	uses?: Maybe<Scalars['Int']>;
}

export interface StagingTagsMinOrderBy {
	content?: Maybe<OrderBy>;
	createdAt?: Maybe<OrderBy>;
	guild?: Maybe<OrderBy>;
	lastModified?: Maybe<OrderBy>;
	name?: Maybe<OrderBy>;
	updatedAt?: Maybe<OrderBy>;
	user?: Maybe<OrderBy>;
	uses?: Maybe<OrderBy>;
}

export interface StagingTagsMutationResponse {
	affected_rows: Scalars['Int'];
	returning: Array<StagingTags>;
}

export interface StagingTagsObjRelInsertInput {
	data: StagingTagsInsertInput;
	on_conflict?: Maybe<StagingTagsOnConflict>;
}

export interface StagingTagsOnConflict {
	constraint: StagingTagsConstraint;
	update_columns: Array<StagingTagsUpdateColumn>;
	where?: Maybe<StagingTagsBoolExp>;
}

export interface StagingTagsOrderBy {
	aliases?: Maybe<OrderBy>;
	content?: Maybe<OrderBy>;
	createdAt?: Maybe<OrderBy>;
	guild?: Maybe<OrderBy>;
	hoisted?: Maybe<OrderBy>;
	id?: Maybe<OrderBy>;
	lastModified?: Maybe<OrderBy>;
	name?: Maybe<OrderBy>;
	templated?: Maybe<OrderBy>;
	updatedAt?: Maybe<OrderBy>;
	user?: Maybe<OrderBy>;
	uses?: Maybe<OrderBy>;
}

export enum StagingTagsSelectColumn {
	Aliases = 'aliases',
	Content = 'content',
	CreatedAt = 'createdAt',
	Guild = 'guild',
	Hoisted = 'hoisted',
	Id = 'id',
	LastModified = 'lastModified',
	Name = 'name',
	Templated = 'templated',
	UpdatedAt = 'updatedAt',
	User = 'user',
	Uses = 'uses',
}

export interface StagingTagsSetInput {
	aliases?: Maybe<Scalars['_text']>;
	content?: Maybe<Scalars['String']>;
	createdAt?: Maybe<Scalars['timestamptz']>;
	guild?: Maybe<Scalars['String']>;
	hoisted?: Maybe<Scalars['Boolean']>;
	id?: Maybe<Scalars['uuid']>;
	lastModified?: Maybe<Scalars['String']>;
	name?: Maybe<Scalars['String']>;
	templated?: Maybe<Scalars['Boolean']>;
	updatedAt?: Maybe<Scalars['timestamptz']>;
	user?: Maybe<Scalars['String']>;
	uses?: Maybe<Scalars['Int']>;
}

export interface StagingTagsStddevFields {
	uses?: Maybe<Scalars['Float']>;
}

export interface StagingTagsStddevOrderBy {
	uses?: Maybe<OrderBy>;
}

export interface StagingTagsStddevPopFields {
	uses?: Maybe<Scalars['Float']>;
}

export interface StagingTagsStddevPopOrderBy {
	uses?: Maybe<OrderBy>;
}

export interface StagingTagsStddevSampFields {
	uses?: Maybe<Scalars['Float']>;
}

export interface StagingTagsStddevSampOrderBy {
	uses?: Maybe<OrderBy>;
}

export interface StagingTagsSumFields {
	uses?: Maybe<Scalars['Int']>;
}

export interface StagingTagsSumOrderBy {
	uses?: Maybe<OrderBy>;
}

export enum StagingTagsUpdateColumn {
	Aliases = 'aliases',
	Content = 'content',
	CreatedAt = 'createdAt',
	Guild = 'guild',
	Hoisted = 'hoisted',
	Id = 'id',
	LastModified = 'lastModified',
	Name = 'name',
	Templated = 'templated',
	UpdatedAt = 'updatedAt',
	User = 'user',
	Uses = 'uses',
}

export interface StagingTagsVarPopFields {
	uses?: Maybe<Scalars['Float']>;
}

export interface StagingTagsVarPopOrderBy {
	uses?: Maybe<OrderBy>;
}

export interface StagingTagsVarSampFields {
	uses?: Maybe<Scalars['Float']>;
}

export interface StagingTagsVarSampOrderBy {
	uses?: Maybe<OrderBy>;
}

export interface StagingTagsVarianceFields {
	uses?: Maybe<Scalars['Float']>;
}

export interface StagingTagsVarianceOrderBy {
	uses?: Maybe<OrderBy>;
}

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

export interface SubscriptionRoot {
	cases: Array<Cases>;
	casesAggregate: CasesAggregate;
	casesAggregateStaging: StagingCasesAggregate;
	casesByPk?: Maybe<Cases>;
	casesByPkStaging?: Maybe<StagingCases>;
	casesStaging: Array<StagingCases>;
	lockdowns: Array<Lockdowns>;
	lockdownsAggregate: LockdownsAggregate;
	lockdownsAggregateStaging: StagingLockdownsAggregate;
	lockdownsByPk?: Maybe<Lockdowns>;
	lockdownsByPkStaging?: Maybe<StagingLockdowns>;
	lockdownsStaging: Array<StagingLockdowns>;
	roleStates: Array<RoleStates>;
	roleStatesAggregate: RoleStatesAggregate;
	roleStatesAggregateStaging: StagingRoleStatesAggregate;
	roleStatesByPk?: Maybe<RoleStates>;
	roleStatesByPkStaging?: Maybe<StagingRoleStates>;
	roleStatesStaging: Array<StagingRoleStates>;
	settings: Array<Settings>;
	settingsAggregate: SettingsAggregate;
	settingsAggregateStaging: StagingSettingsAggregate;
	settingsByPk?: Maybe<Settings>;
	settingsByPkStaging?: Maybe<StagingSettings>;
	settingsStaging: Array<StagingSettings>;
	tags: Array<Tags>;
	tagsAggregate: TagsAggregate;
	tagsAggregateStaging: StagingTagsAggregate;
	tagsByPk?: Maybe<Tags>;
	tagsByPkStaging?: Maybe<StagingTags>;
	tagsStaging: Array<StagingTags>;
}

export interface SubscriptionRootCasesArgs {
	distinct_on?: Maybe<Array<CasesSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<CasesOrderBy>>;
	where?: Maybe<CasesBoolExp>;
}

export interface SubscriptionRootCasesAggregateArgs {
	distinct_on?: Maybe<Array<CasesSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<CasesOrderBy>>;
	where?: Maybe<CasesBoolExp>;
}

export interface SubscriptionRootCasesAggregateStagingArgs {
	distinct_on?: Maybe<Array<StagingCasesSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<StagingCasesOrderBy>>;
	where?: Maybe<StagingCasesBoolExp>;
}

export interface SubscriptionRootCasesByPkArgs {
	id: Scalars['uuid'];
}

export interface SubscriptionRootCasesByPkStagingArgs {
	id: Scalars['uuid'];
}

export interface SubscriptionRootCasesStagingArgs {
	distinct_on?: Maybe<Array<StagingCasesSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<StagingCasesOrderBy>>;
	where?: Maybe<StagingCasesBoolExp>;
}

export interface SubscriptionRootLockdownsArgs {
	distinct_on?: Maybe<Array<LockdownsSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<LockdownsOrderBy>>;
	where?: Maybe<LockdownsBoolExp>;
}

export interface SubscriptionRootLockdownsAggregateArgs {
	distinct_on?: Maybe<Array<LockdownsSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<LockdownsOrderBy>>;
	where?: Maybe<LockdownsBoolExp>;
}

export interface SubscriptionRootLockdownsAggregateStagingArgs {
	distinct_on?: Maybe<Array<StagingLockdownsSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<StagingLockdownsOrderBy>>;
	where?: Maybe<StagingLockdownsBoolExp>;
}

export interface SubscriptionRootLockdownsByPkArgs {
	id: Scalars['uuid'];
}

export interface SubscriptionRootLockdownsByPkStagingArgs {
	id: Scalars['uuid'];
}

export interface SubscriptionRootLockdownsStagingArgs {
	distinct_on?: Maybe<Array<StagingLockdownsSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<StagingLockdownsOrderBy>>;
	where?: Maybe<StagingLockdownsBoolExp>;
}

export interface SubscriptionRootRoleStatesArgs {
	distinct_on?: Maybe<Array<RoleStatesSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<RoleStatesOrderBy>>;
	where?: Maybe<RoleStatesBoolExp>;
}

export interface SubscriptionRootRoleStatesAggregateArgs {
	distinct_on?: Maybe<Array<RoleStatesSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<RoleStatesOrderBy>>;
	where?: Maybe<RoleStatesBoolExp>;
}

export interface SubscriptionRootRoleStatesAggregateStagingArgs {
	distinct_on?: Maybe<Array<StagingRoleStatesSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<StagingRoleStatesOrderBy>>;
	where?: Maybe<StagingRoleStatesBoolExp>;
}

export interface SubscriptionRootRoleStatesByPkArgs {
	id: Scalars['uuid'];
}

export interface SubscriptionRootRoleStatesByPkStagingArgs {
	id: Scalars['uuid'];
}

export interface SubscriptionRootRoleStatesStagingArgs {
	distinct_on?: Maybe<Array<StagingRoleStatesSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<StagingRoleStatesOrderBy>>;
	where?: Maybe<StagingRoleStatesBoolExp>;
}

export interface SubscriptionRootSettingsArgs {
	distinct_on?: Maybe<Array<SettingsSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<SettingsOrderBy>>;
	where?: Maybe<SettingsBoolExp>;
}

export interface SubscriptionRootSettingsAggregateArgs {
	distinct_on?: Maybe<Array<SettingsSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<SettingsOrderBy>>;
	where?: Maybe<SettingsBoolExp>;
}

export interface SubscriptionRootSettingsAggregateStagingArgs {
	distinct_on?: Maybe<Array<StagingSettingsSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<StagingSettingsOrderBy>>;
	where?: Maybe<StagingSettingsBoolExp>;
}

export interface SubscriptionRootSettingsByPkArgs {
	guild: Scalars['String'];
}

export interface SubscriptionRootSettingsByPkStagingArgs {
	guild: Scalars['String'];
}

export interface SubscriptionRootSettingsStagingArgs {
	distinct_on?: Maybe<Array<StagingSettingsSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<StagingSettingsOrderBy>>;
	where?: Maybe<StagingSettingsBoolExp>;
}

export interface SubscriptionRootTagsArgs {
	distinct_on?: Maybe<Array<TagsSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<TagsOrderBy>>;
	where?: Maybe<TagsBoolExp>;
}

export interface SubscriptionRootTagsAggregateArgs {
	distinct_on?: Maybe<Array<TagsSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<TagsOrderBy>>;
	where?: Maybe<TagsBoolExp>;
}

export interface SubscriptionRootTagsAggregateStagingArgs {
	distinct_on?: Maybe<Array<StagingTagsSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<StagingTagsOrderBy>>;
	where?: Maybe<StagingTagsBoolExp>;
}

export interface SubscriptionRootTagsByPkArgs {
	id: Scalars['uuid'];
}

export interface SubscriptionRootTagsByPkStagingArgs {
	id: Scalars['uuid'];
}

export interface SubscriptionRootTagsStagingArgs {
	distinct_on?: Maybe<Array<StagingTagsSelectColumn>>;
	limit?: Maybe<Scalars['Int']>;
	offset?: Maybe<Scalars['Int']>;
	order_by?: Maybe<Array<StagingTagsOrderBy>>;
	where?: Maybe<StagingTagsBoolExp>;
}

export interface Tags {
	aliases: Scalars['_text'];
	content: Scalars['String'];
	createdAt: Scalars['timestamptz'];
	guild: Scalars['String'];
	hoisted?: Maybe<Scalars['Boolean']>;
	id: Scalars['uuid'];
	lastModified?: Maybe<Scalars['String']>;
	name: Scalars['String'];
	templated: Scalars['Boolean'];
	updatedAt: Scalars['timestamptz'];
	user: Scalars['String'];
	uses: Scalars['Int'];
}

export interface TagsAggregate {
	aggregate?: Maybe<TagsAggregateFields>;
	nodes: Array<Tags>;
}

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

export interface TagsAggregateFieldsCountArgs {
	columns?: Maybe<Array<TagsSelectColumn>>;
	distinct?: Maybe<Scalars['Boolean']>;
}

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

export interface TagsArrRelInsertInput {
	data: Array<TagsInsertInput>;
	on_conflict?: Maybe<TagsOnConflict>;
}

export interface TagsAvgFields {
	uses?: Maybe<Scalars['Float']>;
}

export interface TagsAvgOrderBy {
	uses?: Maybe<OrderBy>;
}

export interface TagsBoolExp {
	_and?: Maybe<Array<Maybe<TagsBoolExp>>>;
	_not?: Maybe<TagsBoolExp>;
	_or?: Maybe<Array<Maybe<TagsBoolExp>>>;
	aliases?: Maybe<TextComparisonExp>;
	content?: Maybe<StringComparisonExp>;
	createdAt?: Maybe<TimestamptzComparisonExp>;
	guild?: Maybe<StringComparisonExp>;
	hoisted?: Maybe<BooleanComparisonExp>;
	id?: Maybe<UuidComparisonExp>;
	lastModified?: Maybe<StringComparisonExp>;
	name?: Maybe<StringComparisonExp>;
	templated?: Maybe<BooleanComparisonExp>;
	updatedAt?: Maybe<TimestamptzComparisonExp>;
	user?: Maybe<StringComparisonExp>;
	uses?: Maybe<IntComparisonExp>;
}

export enum TagsConstraint {
	TagsGuildNameKey = 'tags_guild_name_key',
	TagsPkey = 'tags_pkey',
}

export interface TagsIncInput {
	uses?: Maybe<Scalars['Int']>;
}

export interface TagsInsertInput {
	aliases?: Maybe<Scalars['_text']>;
	content?: Maybe<Scalars['String']>;
	createdAt?: Maybe<Scalars['timestamptz']>;
	guild?: Maybe<Scalars['String']>;
	hoisted?: Maybe<Scalars['Boolean']>;
	id?: Maybe<Scalars['uuid']>;
	lastModified?: Maybe<Scalars['String']>;
	name?: Maybe<Scalars['String']>;
	templated?: Maybe<Scalars['Boolean']>;
	updatedAt?: Maybe<Scalars['timestamptz']>;
	user?: Maybe<Scalars['String']>;
	uses?: Maybe<Scalars['Int']>;
}

export interface TagsMaxFields {
	content?: Maybe<Scalars['String']>;
	createdAt?: Maybe<Scalars['timestamptz']>;
	guild?: Maybe<Scalars['String']>;
	lastModified?: Maybe<Scalars['String']>;
	name?: Maybe<Scalars['String']>;
	updatedAt?: Maybe<Scalars['timestamptz']>;
	user?: Maybe<Scalars['String']>;
	uses?: Maybe<Scalars['Int']>;
}

export interface TagsMaxOrderBy {
	content?: Maybe<OrderBy>;
	createdAt?: Maybe<OrderBy>;
	guild?: Maybe<OrderBy>;
	lastModified?: Maybe<OrderBy>;
	name?: Maybe<OrderBy>;
	updatedAt?: Maybe<OrderBy>;
	user?: Maybe<OrderBy>;
	uses?: Maybe<OrderBy>;
}

export interface TagsMinFields {
	content?: Maybe<Scalars['String']>;
	createdAt?: Maybe<Scalars['timestamptz']>;
	guild?: Maybe<Scalars['String']>;
	lastModified?: Maybe<Scalars['String']>;
	name?: Maybe<Scalars['String']>;
	updatedAt?: Maybe<Scalars['timestamptz']>;
	user?: Maybe<Scalars['String']>;
	uses?: Maybe<Scalars['Int']>;
}

export interface TagsMinOrderBy {
	content?: Maybe<OrderBy>;
	createdAt?: Maybe<OrderBy>;
	guild?: Maybe<OrderBy>;
	lastModified?: Maybe<OrderBy>;
	name?: Maybe<OrderBy>;
	updatedAt?: Maybe<OrderBy>;
	user?: Maybe<OrderBy>;
	uses?: Maybe<OrderBy>;
}

export interface TagsMutationResponse {
	affected_rows: Scalars['Int'];
	returning: Array<Tags>;
}

export interface TagsObjRelInsertInput {
	data: TagsInsertInput;
	on_conflict?: Maybe<TagsOnConflict>;
}

export interface TagsOnConflict {
	constraint: TagsConstraint;
	update_columns: Array<TagsUpdateColumn>;
	where?: Maybe<TagsBoolExp>;
}

export interface TagsOrderBy {
	aliases?: Maybe<OrderBy>;
	content?: Maybe<OrderBy>;
	createdAt?: Maybe<OrderBy>;
	guild?: Maybe<OrderBy>;
	hoisted?: Maybe<OrderBy>;
	id?: Maybe<OrderBy>;
	lastModified?: Maybe<OrderBy>;
	name?: Maybe<OrderBy>;
	templated?: Maybe<OrderBy>;
	updatedAt?: Maybe<OrderBy>;
	user?: Maybe<OrderBy>;
	uses?: Maybe<OrderBy>;
}

export enum TagsSelectColumn {
	Aliases = 'aliases',
	Content = 'content',
	CreatedAt = 'createdAt',
	Guild = 'guild',
	Hoisted = 'hoisted',
	Id = 'id',
	LastModified = 'lastModified',
	Name = 'name',
	Templated = 'templated',
	UpdatedAt = 'updatedAt',
	User = 'user',
	Uses = 'uses',
}

export interface TagsSetInput {
	aliases?: Maybe<Scalars['_text']>;
	content?: Maybe<Scalars['String']>;
	createdAt?: Maybe<Scalars['timestamptz']>;
	guild?: Maybe<Scalars['String']>;
	hoisted?: Maybe<Scalars['Boolean']>;
	id?: Maybe<Scalars['uuid']>;
	lastModified?: Maybe<Scalars['String']>;
	name?: Maybe<Scalars['String']>;
	templated?: Maybe<Scalars['Boolean']>;
	updatedAt?: Maybe<Scalars['timestamptz']>;
	user?: Maybe<Scalars['String']>;
	uses?: Maybe<Scalars['Int']>;
}

export interface TagsStddevFields {
	uses?: Maybe<Scalars['Float']>;
}

export interface TagsStddevOrderBy {
	uses?: Maybe<OrderBy>;
}

export interface TagsStddevPopFields {
	uses?: Maybe<Scalars['Float']>;
}

export interface TagsStddevPopOrderBy {
	uses?: Maybe<OrderBy>;
}

export interface TagsStddevSampFields {
	uses?: Maybe<Scalars['Float']>;
}

export interface TagsStddevSampOrderBy {
	uses?: Maybe<OrderBy>;
}

export interface TagsSumFields {
	uses?: Maybe<Scalars['Int']>;
}

export interface TagsSumOrderBy {
	uses?: Maybe<OrderBy>;
}

export enum TagsUpdateColumn {
	Aliases = 'aliases',
	Content = 'content',
	CreatedAt = 'createdAt',
	Guild = 'guild',
	Hoisted = 'hoisted',
	Id = 'id',
	LastModified = 'lastModified',
	Name = 'name',
	Templated = 'templated',
	UpdatedAt = 'updatedAt',
	User = 'user',
	Uses = 'uses',
}

export interface TagsVarPopFields {
	uses?: Maybe<Scalars['Float']>;
}

export interface TagsVarPopOrderBy {
	uses?: Maybe<OrderBy>;
}

export interface TagsVarSampFields {
	uses?: Maybe<Scalars['Float']>;
}

export interface TagsVarSampOrderBy {
	uses?: Maybe<OrderBy>;
}

export interface TagsVarianceFields {
	uses?: Maybe<Scalars['Float']>;
}

export interface TagsVarianceOrderBy {
	uses?: Maybe<OrderBy>;
}

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

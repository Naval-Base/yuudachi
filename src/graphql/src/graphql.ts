/* eslint-disable */
import { GraphQLResolveInfo } from 'graphql';
import { Context } from './interfaces/Context';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type PartialGuild = {
  __typename?: 'PartialGuild';
  id: Scalars['String'];
  name: Scalars['String'];
  icon?: Maybe<Scalars['String']>;
  owner: Scalars['Boolean'];
  features: Array<Maybe<Scalars['String']>>;
  permissions: Scalars['String'];
};

export type PermissionOverwrite = {
  __typename?: 'PermissionOverwrite';
  id: Scalars['String'];
  type: Scalars['Int'];
  allow: Scalars['String'];
  deny: Scalars['String'];
};

export type GuildChannel = {
  __typename?: 'GuildChannel';
  id: Scalars['String'];
  type: Scalars['Int'];
  guild_id?: Maybe<Scalars['String']>;
  position?: Maybe<Scalars['Int']>;
  permission_overwrites?: Maybe<Array<Maybe<PermissionOverwrite>>>;
  name?: Maybe<Scalars['String']>;
  topic?: Maybe<Scalars['String']>;
  nsfw?: Maybe<Scalars['Boolean']>;
  last_message_id?: Maybe<Scalars['String']>;
  bitrate?: Maybe<Scalars['Int']>;
  user_limit?: Maybe<Scalars['Int']>;
  rate_limit_per_user?: Maybe<Scalars['Int']>;
  icon?: Maybe<Scalars['String']>;
  parent_id?: Maybe<Scalars['String']>;
  last_pin_timestamp?: Maybe<Scalars['String']>;
};

export type GuildRoleTag = {
  __typename?: 'GuildRoleTag';
  bot_id?: Maybe<Scalars['String']>;
  premium_subscriber?: Maybe<Scalars['String']>;
  integration_id?: Maybe<Scalars['String']>;
};

export type GuildRole = {
  __typename?: 'GuildRole';
  id: Scalars['String'];
  name: Scalars['String'];
  color: Scalars['Int'];
  hoist: Scalars['Boolean'];
  position: Scalars['Int'];
  permissions: Scalars['String'];
  managed: Scalars['Boolean'];
  mentionable: Scalars['Boolean'];
  tags?: Maybe<Array<Maybe<GuildRoleTag>>>;
};

export type User = {
  __typename?: 'User';
  id: Scalars['String'];
  username: Scalars['String'];
  discriminator: Scalars['String'];
  avatar?: Maybe<Scalars['String']>;
  bot?: Maybe<Scalars['Boolean']>;
  system?: Maybe<Scalars['Boolean']>;
  mfa_enabled?: Maybe<Scalars['Boolean']>;
  locale?: Maybe<Scalars['String']>;
  verified?: Maybe<Scalars['Boolean']>;
  email?: Maybe<Scalars['String']>;
  flags?: Maybe<Scalars['Int']>;
  premium_type?: Maybe<Scalars['Int']>;
  public_flags?: Maybe<Scalars['Int']>;
};

export type Case = {
  __typename?: 'Case';
  caseId: Scalars['Int'];
  guildId: Scalars['String'];
  targetId: Scalars['String'];
  moderatorId: Scalars['String'];
  action: Scalars['Int'];
  roleId?: Maybe<Scalars['String']>;
  actionExpiration?: Maybe<Scalars['String']>;
  reason?: Maybe<Scalars['String']>;
  deleteMessageDays?: Maybe<Scalars['String']>;
  contextMessageId?: Maybe<Scalars['String']>;
  referenceId?: Maybe<Scalars['Int']>;
};

export type GuildActionInput = {
  __typename?: 'GuildActionInput';
  guild_id: Scalars['String'];
  action: Scalars['Int'];
  reason?: Maybe<Scalars['String']>;
  moderatorId: Scalars['String'];
  targetId: Scalars['String'];
  contextMessageId?: Maybe<Scalars['String']>;
  referenceId?: Maybe<Scalars['Int']>;
};

export type Query = {
  __typename?: 'Query';
  guild?: Maybe<PartialGuild>;
  guild_action: Array<Maybe<Case>>;
  guilds: Array<Maybe<PartialGuild>>;
  guilds_oauth: Array<Maybe<PartialGuild>>;
  guild_channels?: Maybe<Array<Maybe<GuildChannel>>>;
  guild_roles?: Maybe<Array<Maybe<GuildRole>>>;
  user?: Maybe<User>;
};


export type QueryGuildArgs = {
  guild_id: Scalars['String'];
};


export type QueryGuild_ActionArgs = {
  action?: Maybe<GuildActionInput>;
};


export type QueryGuild_ChannelsArgs = {
  guild_id: Scalars['String'];
};


export type QueryGuild_RolesArgs = {
  guild_id: Scalars['String'];
};


export type QueryUserArgs = {
  user_id: Scalars['String'];
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type LegacyStitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type NewStitchingResolver<TResult, TParent, TContext, TArgs> = {
  selectionSet: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type StitchingResolver<TResult, TParent, TContext, TArgs> = LegacyStitchingResolver<TResult, TParent, TContext, TArgs> | NewStitchingResolver<TResult, TParent, TContext, TArgs>;
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  PartialGuild: ResolverTypeWrapper<PartialGuild>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  PermissionOverwrite: ResolverTypeWrapper<PermissionOverwrite>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  GuildChannel: ResolverTypeWrapper<GuildChannel>;
  GuildRoleTag: ResolverTypeWrapper<GuildRoleTag>;
  GuildRole: ResolverTypeWrapper<GuildRole>;
  User: ResolverTypeWrapper<User>;
  Case: ResolverTypeWrapper<Case>;
  GuildActionInput: ResolverTypeWrapper<GuildActionInput>;
  Query: ResolverTypeWrapper<{}>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  PartialGuild: PartialGuild;
  String: Scalars['String'];
  Boolean: Scalars['Boolean'];
  PermissionOverwrite: PermissionOverwrite;
  Int: Scalars['Int'];
  GuildChannel: GuildChannel;
  GuildRoleTag: GuildRoleTag;
  GuildRole: GuildRole;
  User: User;
  Case: Case;
  GuildActionInput: GuildActionInput;
  Query: {};
};

export type PartialGuildResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PartialGuild'] = ResolversParentTypes['PartialGuild']> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  icon?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  owner?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  features?: Resolver<Array<Maybe<ResolversTypes['String']>>, ParentType, ContextType>;
  permissions?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PermissionOverwriteResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PermissionOverwrite'] = ResolversParentTypes['PermissionOverwrite']> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  allow?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  deny?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GuildChannelResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GuildChannel'] = ResolversParentTypes['GuildChannel']> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  guild_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  position?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  permission_overwrites?: Resolver<Maybe<Array<Maybe<ResolversTypes['PermissionOverwrite']>>>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  topic?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  nsfw?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  last_message_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  bitrate?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  user_limit?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  rate_limit_per_user?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  icon?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  parent_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  last_pin_timestamp?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GuildRoleTagResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GuildRoleTag'] = ResolversParentTypes['GuildRoleTag']> = {
  bot_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  premium_subscriber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  integration_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GuildRoleResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GuildRole'] = ResolversParentTypes['GuildRole']> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  color?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  hoist?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  position?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  permissions?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  managed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  mentionable?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  tags?: Resolver<Maybe<Array<Maybe<ResolversTypes['GuildRoleTag']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResolvers<ContextType = Context, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  username?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  discriminator?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  avatar?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  bot?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  system?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  mfa_enabled?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  locale?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  verified?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  flags?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  premium_type?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  public_flags?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CaseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Case'] = ResolversParentTypes['Case']> = {
  caseId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  guildId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  targetId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  moderatorId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  action?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  roleId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  actionExpiration?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  reason?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  deleteMessageDays?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contextMessageId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  referenceId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GuildActionInputResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GuildActionInput'] = ResolversParentTypes['GuildActionInput']> = {
  guild_id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  action?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  reason?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  moderatorId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  targetId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  contextMessageId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  referenceId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  guild?: Resolver<Maybe<ResolversTypes['PartialGuild']>, ParentType, ContextType, RequireFields<QueryGuildArgs, 'guild_id'>>;
  guild_action?: Resolver<Array<Maybe<ResolversTypes['Case']>>, ParentType, ContextType, RequireFields<QueryGuild_ActionArgs, never>>;
  guilds?: Resolver<Array<Maybe<ResolversTypes['PartialGuild']>>, ParentType, ContextType>;
  guilds_oauth?: Resolver<Array<Maybe<ResolversTypes['PartialGuild']>>, ParentType, ContextType>;
  guild_channels?: Resolver<Maybe<Array<Maybe<ResolversTypes['GuildChannel']>>>, ParentType, ContextType, RequireFields<QueryGuild_ChannelsArgs, 'guild_id'>>;
  guild_roles?: Resolver<Maybe<Array<Maybe<ResolversTypes['GuildRole']>>>, ParentType, ContextType, RequireFields<QueryGuild_RolesArgs, 'guild_id'>>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryUserArgs, 'user_id'>>;
};

export type Resolvers<ContextType = Context> = {
  PartialGuild?: PartialGuildResolvers<ContextType>;
  PermissionOverwrite?: PermissionOverwriteResolvers<ContextType>;
  GuildChannel?: GuildChannelResolvers<ContextType>;
  GuildRoleTag?: GuildRoleTagResolvers<ContextType>;
  GuildRole?: GuildRoleResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  Case?: CaseResolvers<ContextType>;
  GuildActionInput?: GuildActionInputResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
};


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = Context> = Resolvers<ContextType>;

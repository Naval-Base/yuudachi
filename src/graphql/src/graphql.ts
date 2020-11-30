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
  permissions: Scalars['Int'];
  permissions_new: Scalars['String'];
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
  permissions: Scalars['Int'];
  permissions_new: Scalars['String'];
  managed: Scalars['Boolean'];
  mentionable: Scalars['Boolean'];
  tags?: Maybe<Array<Maybe<GuildRoleTag>>>;
};

export type Query = {
  __typename?: 'Query';
  guild?: Maybe<PartialGuild>;
  guilds: Array<Maybe<PartialGuild>>;
  guilds_oauth: Array<Maybe<PartialGuild>>;
  guild_roles?: Maybe<Array<Maybe<GuildRole>>>;
};


export type QueryGuildArgs = {
  guild_id: Scalars['String'];
};


export type QueryGuild_RolesArgs = {
  guild_id: Scalars['String'];
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
  Int: ResolverTypeWrapper<Scalars['Int']>;
  GuildRoleTag: ResolverTypeWrapper<GuildRoleTag>;
  GuildRole: ResolverTypeWrapper<GuildRole>;
  Query: ResolverTypeWrapper<{}>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  PartialGuild: PartialGuild;
  String: Scalars['String'];
  Boolean: Scalars['Boolean'];
  Int: Scalars['Int'];
  GuildRoleTag: GuildRoleTag;
  GuildRole: GuildRole;
  Query: {};
};

export type PartialGuildResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PartialGuild'] = ResolversParentTypes['PartialGuild']> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  icon?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  owner?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  features?: Resolver<Array<Maybe<ResolversTypes['String']>>, ParentType, ContextType>;
  permissions?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  permissions_new?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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
  permissions?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  permissions_new?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  managed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  mentionable?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  tags?: Resolver<Maybe<Array<Maybe<ResolversTypes['GuildRoleTag']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  guild?: Resolver<Maybe<ResolversTypes['PartialGuild']>, ParentType, ContextType, RequireFields<QueryGuildArgs, 'guild_id'>>;
  guilds?: Resolver<Array<Maybe<ResolversTypes['PartialGuild']>>, ParentType, ContextType>;
  guilds_oauth?: Resolver<Array<Maybe<ResolversTypes['PartialGuild']>>, ParentType, ContextType>;
  guild_roles?: Resolver<Maybe<Array<Maybe<ResolversTypes['GuildRole']>>>, ParentType, ContextType, RequireFields<QueryGuild_RolesArgs, 'guild_id'>>;
};

export type Resolvers<ContextType = Context> = {
  PartialGuild?: PartialGuildResolvers<ContextType>;
  GuildRoleTag?: GuildRoleTagResolvers<ContextType>;
  GuildRole?: GuildRoleResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
};


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = Context> = Resolvers<ContextType>;

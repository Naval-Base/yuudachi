import { gql } from 'apollo-server-express';

export default gql`
	type PartialGuild {
		id: String!
		name: String!
		icon: String
		owner: Boolean!
		features: [String]!
		permissions: Int!
		permissions_new: String!
	}

	type GuildRoleTag {
		bot_id: String
		premium_subscriber: String
		integration_id: String
	}

	type GuildRole {
		id: String!
		name: String!
		color: Int!
		hoist: Boolean!
		position: Int!
		permissions: Int!
		permissions_new: String!
		managed: Boolean!
		mentionable: Boolean!
		tags: [GuildRoleTag]
	}

	type Query {
		guild(guild_id: String!): PartialGuild
		guilds: [PartialGuild]!
		guilds_oauth: [PartialGuild]!
		guild_roles(guild_id: String!): [GuildRole]
	}
`;

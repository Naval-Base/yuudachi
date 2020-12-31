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

	type User {
		id: String!
		username: String!
		discriminator: String!
		avatar: String
		bot: Boolean
		system: Boolean
		mfa_enabled: Boolean
		locale: String
		verified: Boolean
		email: String
		flags: Int
		premium_type: Int
		public_flags: Int
	}

	type Query {
		guild(guild_id: String!): PartialGuild
		guilds: [PartialGuild]!
		guilds_oauth: [PartialGuild]!
		guild_roles(guild_id: String!): [GuildRole]
		user(user_id: String!): User
	}
`;

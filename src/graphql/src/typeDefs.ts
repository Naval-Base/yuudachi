import { gql } from 'apollo-server-express';

export default gql`
	type PartialGuild {
		id: String!
		name: String!
		icon: String
		owner: Boolean!
		features: [String]!
		permissions: String!
	}

	type PermissionOverwrite {
		id: String!
		type: Int!
		allow: String!
		deny: String!
	}

	type GuildChannel {
		id: String!
		type: Int!
		guild_id: String
		position: Int
		permission_overwrites: [PermissionOverwrite]
		name: String
		topic: String
		nsfw: Boolean
		last_message_id: String
		bitrate: Int
		user_limit: Int
		rate_limit_per_user: Int
		icon: String
		parent_id: String
		last_pin_timestamp: String
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
		permissions: String!
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

	type Case {
		caseId: Int!
		guildId: String!
		targetId: String!
		moderatorId: String!
		action: Int!
		roleId: String
		actionExpiration: String
		reason: String
		deleteMessageDays: String
		contextMessageId: String
		referenceId: Int
	}

	input GuildActionInput {
		guild_id: String!
		action: Int!
		reason: String
		moderatorId: String!
		targetId: String!
		contextMessageId: String
		referenceId: Int
	}

	type Query {
		guild(guild_id: String!): PartialGuild
		guild_action(action: GuildActionInput): [Case]!
		guilds: [PartialGuild]!
		guilds_oauth: [PartialGuild]!
		guild_channels(guild_id: String!): [GuildChannel]
		guild_roles(guild_id: String!): [GuildRole]
		user(user_id: String!): User
	}
`;

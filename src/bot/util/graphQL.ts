import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import gql from 'graphql-tag';
import fetch from 'node-fetch';
import { PRODUCTION } from './constants';

export const graphQLClient = new ApolloClient({
	cache: new InMemoryCache(),
	// @ts-ignore
	link: new HttpLink({
		uri: process.env.GRAPHQL_ENDPOINT!,
		headers: {
			'X-Hasura-Admin-Secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
		},
		fetch,
	}),
	defaultOptions: {
		query: {
			fetchPolicy: 'no-cache',
		},
		mutate: {
			fetchPolicy: 'no-cache',
		},
	},
});

export const GRAPHQL = {
	ENDPOINT: process.env.GRAPHQL_ENDPOINT!,

	QUERY: {
		SETTINGS: gql`
			query {
				${PRODUCTION ? '' : 'staging_'}settings {
					guild
					settings
				}
			}
		`,

		CASES: gql`
			query($guild: String!, $case_id: Int!) {
				${PRODUCTION ? '' : 'staging_'}cases(where: {
					guild: { _eq: $guild },
					case_id: { _eq: $case_id }
				}) {
					action
					action_duration
					case_id
					created_at
					id
					message
					mod_id
					mod_tag
					target_id
					target_tag
					reason
					ref_id
				}
			}
		`,

		LOG_CASE: gql`
			query($guild: String!, $case_id: Int!) {
				${PRODUCTION ? '' : 'staging_'}cases(where: {
					guild: { _eq: $guild },
					case_id: { _eq: $case_id }
				}, order_by: { case_id: asc }) {
					id
					message
				}
			}
		`,

		HISTORY_CASE: gql`
			query($target_id: String!) {
				${PRODUCTION ? '' : 'staging_'}cases(where: {
					target_id: { _eq: $target_id }
				}) {
					action
				}
			}
		`,

		FIX_CASES: gql`
			query($guild: String!, $case_id: Int!) {
				${PRODUCTION ? '' : 'staging_'}cases(where: {
					guild: { _eq: $guild },
					case_id: { _gt: $case_id }
				}, order_by: { case_id: asc }) {
					id
					message
				}
			}
		`,

		MUTES: gql`
			query($action_duration: timestamptz!, $action_processed: Boolean!) {
				${PRODUCTION ? '' : 'staging_'}cases(where: {
					action_duration: { _gt: $action_duration },
					action_processed: { _eq: $action_processed }
				}) {
					action_duration
					guild
					id
					target_id
					target_tag
				}
			}
		`,

		MUTE_DURATION: gql`
			query($guild: String!, $case_id: Int!, $action: Int!, $action_processed: Boolean!) {
				${PRODUCTION ? '' : 'staging_'}cases(where: {
					guild: { _eq: $guild },
					case_id: { _eq: $case_id },
					action: { _eq: $action },
					action_processed: { _eq: $action_processed }
				}) {
					action
					action_duration
					action_processed
					case_id
					created_at
					guild
					id
					message
					mod_id
					mod_tag
					reason
					ref_id
					target_id
					target_tag
				}
			}
		`,

		MUTE_MEMBER: gql`
			query($guild: String!, $target_id: String!, $action_processed: Boolean!) {
				${PRODUCTION ? '' : 'staging_'}cases(where: {
					guild: { _eq: $guild },
					target_id: { _eq: $target_id }
					action_processed: { _eq: $action_processed },
				}) {
					action
					action_duration
					action_processed
					case_id
					created_at
					guild
					id
					message
					mod_id
					mod_tag
					reason
					ref_id
					target_id
					target_tag
				}
			}
		`,

		LOCKDOWNS_DURATION: gql`
			query($duration: timestamptz!) {
				${PRODUCTION ? '' : 'staging_'}lockdowns(where: {
					duration: { _gt: $duration }
				}) {
					channel
					duration
					guild
					id
				}
			}
		`,

		LOCKDOWNS_CHANNEL: gql`
			query($channel: String!) {
				${PRODUCTION ? '' : 'staging_'}lockdowns(where: {
					channel: { _eq: $channel }
				}) {
					channel
					duration
					guild
					id
				}
			}
		`,

		ROLE_STATES: gql`
			query($guild: String!, $member: String!) {
				${PRODUCTION ? '' : 'staging_'}role_states(where: {
					guild: { _eq: $guild },
					member: { _eq: $member }
				}) {
					roles
				}
			}
		`,

		TAGS: gql`
			query($guild: String!) {
				${PRODUCTION ? '' : 'staging_'}tags(where: {
					guild: { _eq: $guild }
				}) {
					content
					hoisted
					name
					user
				}
			}
		`,

		TAGS_MEMBER: gql`
			query($guild: String!, $user: String!) {
				${PRODUCTION ? '' : 'staging_'}tags(where: {
					guild: { _eq: $guild },
					user: { _eq: $user }
				}) {
					content
					hoisted
					name
					user
				}
			}
		`,

		TAGS_TYPE: gql`
			query($guild: String!) {
				${PRODUCTION ? '' : 'staging_'}tags(where: {
					guild: { _eq: $guild }
				}) {
					aliases
					content
					created_at
					guild
					id
					last_modified
					name
					templated
					updated_at
					user
					uses
				}
			}
		`,
	},

	MUTATION: {
		UPDATE_SETTINGS: gql`
			mutation($guild: String!, $settings: jsonb!) {
				insert${PRODUCTION ? '' : '_staging'}_settings(
					objects: { guild: $guild, settings: $settings },
					on_conflict: { constraint: settings_pkey, update_columns: settings }
				) {
					returning {
						guild
						settings
					}
				}
			}
		`,

		DELETE_SETTINGS: gql`
			mutation($guild: String!) {
				delete${PRODUCTION ? '' : '_staging'}_settings(where: { guild: { _eq: $guild } }) {
					returning {
						guild
						settings
					}
				}
			}
		`,

		INSERT_ROLE_STATE: gql`
			mutation($objects: [${PRODUCTION ? '' : 'staging_'}role_states_insert_input!]!) {
				insert${PRODUCTION ? '' : '_staging'}_role_states(objects: $objects) {
					affected_rows
				}
			}
		`,

		DELETE_ROLE_STATE: gql`
			mutation($guild: String!) {
				delete${PRODUCTION ? '' : '_staging'}_role_states(where: {
					guild: { _eq: $guild }
				}) {
					affected_rows
				}
			}
		`,

		DELETE_MEMBER_ROLE_STATE: gql`
			mutation($guild: String!, $member: String!) {
				delete${PRODUCTION ? '' : '_staging'}_role_states(where: {
					guild: { _eq: $guild },
					member: { _eq: $member }
				}) {
					affected_rows
				}
			}
		`,

		UPDATE_ROLE_STATE: gql`
			mutation($guild: String!, $member: String!, $roles: _text!) {
				insert${PRODUCTION ? '' : '_staging'}_role_states(
					objects: { guild: $guild, member: $member, roles: $roles },
					on_conflict: { constraint: role_states_guild_member_key, update_columns: roles }
				) {
					affected_rows
				}
			}
		`,

		INSERT_CASES: gql`
			mutation(
				$action: Int!,
				$action_duration: timestamptz,
				$action_processed: Boolean,
				$case_id: Int!,
				$guild: String!,
				$message: String,
				$mod_id: String,
				$mod_tag: String,
				$reason: String,
				$ref_id: Int,
				$target_id: String,
				$target_tag: String
			) {
				insert${PRODUCTION ? '' : '_staging'}_cases(objects: {
					action: $action,
					action_duration: $action_duration
					action_processed: $action_processed
					case_id: $case_id,
					guild: $guild,
					message: $message
					mod_id: $mod_id,
					mod_tag: $mod_tag,
					reason: $reason
					ref_id: $ref_id
					target_id: $target_id,
					target_tag: $target_tag
				}) {
					returning {
						action
						action_duration
						action_processed
						case_id
						created_at
						guild
						id
						message
						mod_id
						mod_tag
						reason
						ref_id
						target_id
						target_tag
					}
				}
			}
		`,

		LOG_CASE: gql`
			mutation($id: uuid!, $message: String!) {
				update${PRODUCTION ? '' : '_staging'}_cases(where: {
					id: { _eq: $id }
				}, _set: { message: $message }) {
					affected_rows
				}
			}
		`,

		FIX_CASE: gql`
			mutation($id: uuid!, $case_id: Int!) {
				update${PRODUCTION ? '' : '_staging'}_cases(where: {
					id: { _eq: $id }
				}, _set: { case_id: $case_id }) {
					affected_rows
				}
			}
		`,

		DELETE_CASE: gql`
			mutation($id: uuid!) {
				delete${PRODUCTION ? '' : '_staging'}_cases(where: {
					id: { _eq: $id }
				}) {
					affected_rows
				}
			}
		`,

		CANCEL_MUTE: gql`
			mutation($id: uuid!, $action_processed: Boolean!) {
				update${PRODUCTION ? '' : '_staging'}_cases(where: {
					id: { _eq: $id }
				}, _set: { action_processed: $action_processed }) {
					affected_rows
				}
			}
		`,

		UPDATE_DURATION_MUTE: gql`
			mutation($id: uuid!, $action_duration: timestamptz!) {
				update${PRODUCTION ? '' : '_staging'}_cases(where: {
					id: { _eq: $id }
				}, _set: { action_duration: $action_duration }) {
					returning {
						action
						action_duration
						action_processed
						case_id
						created_at
						guild
						id
						message
						mod_id
						mod_tag
						reason
						ref_id
						target_id
						target_tag
					}
				}
			}
		`,

		UPDATE_REASON: gql`
			mutation($id: uuid!, $mod_id: String!, $mod_tag: String!, $reason: String!) {
				update${PRODUCTION ? '' : '_staging'}_cases(where: {
					id: { _eq: $id }
				}, _set: { mod_id: $mod_id, mod_tag: $mod_tag, reason: $reason }) {
					affected_rows
				}
			}
		`,

		INSERT_LOCKDOWNS: gql`
			mutation($guild: String!, $channel: String!, $duration: timestamptz!) {
				insert${PRODUCTION ? '' : '_staging'}_lockdowns(objects: {
					guild: $guild,
					channel: $channel,
					duration: $duration
				}) {
					returning {
						id
						guild
						channel
						duration
					}
				}
			}
		`,

		CANCEL_LOCKDOWN: gql`
			mutation($id: uuid!) {
				delete${PRODUCTION ? '' : '_staging'}_lockdowns(where: {
					id: { _eq: $id }
				}) {
					affected_rows
				}
			}
		`,

		INSERT_TAG: gql`
			mutation($guild: String!, $user: String!, $name: String!, $hoisted: Boolean, $templated: Boolean, $content: String!) {
				insert${PRODUCTION ? '' : '_staging'}_tags(objects: {
					guild: $guild,
					user: $user,
					name: $name,
					hoisted: $hoisted,
					templated: $templated,
					content: $content
				}) {
					affected_rows
				}
			}
		`,

		UPDATE_TAG_ALIASES: gql`
			mutation($id: uuid!, $aliases: _text!, $last_modified: String!) {
				update${PRODUCTION ? '' : '_staging'}_tags(where: {
					id: { _eq: $id }
				}, _set: { aliases: $aliases, last_modified: $last_modified }) {
					affected_rows
				}
			}
		`,

		UPDATE_TAG_CONTENT: gql`
			mutation($id: uuid!, $hoisted: Boolean, $templated: Boolean, $content: String!, $last_modified: String!) {
				update${PRODUCTION ? '' : '_staging'}_tags(where: {
					id: { _eq: $id }
				}, _set: { hoisted: $hoisted, content: $content, last_modified: $last_modified }) {
					affected_rows
				}
			}
		`,

		UPDATE_TAG_HOIST: gql`
			mutation($id: uuid!, $hoisted: Boolean, $templated: Boolean, $last_modified: String!) {
				update${PRODUCTION ? '' : '_staging'}_tags(where: {
					id: { _eq: $id }
				}, _set: { hoisted: $hoisted, last_modified: $last_modified }) {
					affected_rows
				}
			}
		`,

		UPDATE_TAG_USAGE: gql`
			mutation($id: uuid!, $uses: Int!) {
				update${PRODUCTION ? '' : '_staging'}_tags(where: {
					id: { _eq: $id }
				}, _set: { uses: $uses }) {
					affected_rows
				}
			}
		`,

		DELETE_TAG: gql`
			mutation($id: uuid!) {
				delete${PRODUCTION ? '' : '_staging'}_tags(where: {
					id: { _eq: $id }
				}) {
					affected_rows
				}
			}
		`,
	},
};

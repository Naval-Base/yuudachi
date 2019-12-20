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
		uri: process.env.GRAPHQL_ENDPOINT,
		headers: {
			'X-Hasura-Admin-Secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET,
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
	ENDPOINT: process.env.GRAPHQL_ENDPOINT,

	QUERY: {
		SETTINGS: gql`
			query {
				settings${PRODUCTION ? '' : 'Staging'} {
					guild
					settings
				}
			}
		`,

		CASES: gql`
			query($guild: String!, $caseId: [Int!]!) {
				cases${PRODUCTION ? '' : 'Staging'}(where: {
					guild: { _eq: $guild },
					caseId: { _in: $caseId }
				}) {
					action
					actionDuration
					caseId
					createdAt
					guild
					id
					message
					muteMessage
					modId
					modTag
					targetId
					targetTag
					reason
					refId
				}
			}
		`,

		LOG_CASE: gql`
			query($guild: String!, $caseId: Int!) {
				cases${PRODUCTION ? '' : 'Staging'}(where: {
					guild: { _eq: $guild },
					caseId: { _eq: $caseId }
				}, order_by: { caseId: asc }) {
					id
					message
				}
			}
		`,

		HISTORY_CASE: gql`
			query($targetId: String!) {
				cases${PRODUCTION ? '' : 'Staging'}(where: {
					targetId: { _eq: $targetId }
				}) {
					action
				}
			}
		`,

		FIX_CASES: gql`
			query($guild: String!, $caseId: Int!) {
				cases${PRODUCTION ? '' : 'Staging'}(where: {
					guild: { _eq: $guild },
					caseId: { _gt: $caseId }
				}, order_by: { caseId: asc }) {
					id
					message
				}
			}
		`,

		MUTES: gql`
			query($actionDuration: timestamptz!, $actionProcessed: Boolean!) {
				cases${PRODUCTION ? '' : 'Staging'}(where: {
					actionDuration: { _gt: $actionDuration },
					actionProcessed: { _eq: $actionProcessed }
				}) {
					actionDuration
					guild
					id
					targetId
					targetTag
				}
			}
		`,

		MUTE_DURATION: gql`
			query($guild: String!, $caseId: Int!, $action: Int!, $actionProcessed: Boolean!) {
				cases${PRODUCTION ? '' : 'Staging'}(where: {
					guild: { _eq: $guild },
					caseId: { _eq: $caseId },
					action: { _eq: $action },
					actionProcessed: { _eq: $actionProcessed }
				}) {
					action
					actionDuration
					actionProcessed
					caseId
					createdAt
					guild
					id
					message
					muteMessage
					modId
					modTag
					reason
					refId
					targetId
					targetTag
				}
			}
		`,

		MUTE_MEMBER: gql`
			query($guild: String!, $targetId: String!, $actionProcessed: Boolean!) {
				cases${PRODUCTION ? '' : 'Staging'}(where: {
					guild: { _eq: $guild },
					targetId: { _eq: $targetId },
					actionProcessed: { _eq: $actionProcessed },
				}) {
					action
					actionDuration
					actionProcessed
					caseId
					createdAt
					guild
					id
					message
					muteMessage
					modId
					modTag
					reason
					refId
					targetId
					targetTag
				}
			}
		`,

		LOCKDOWNS_DURATION: gql`
			query($duration: timestamptz!) {
				lockdowns${PRODUCTION ? '' : 'Staging'}(where: {
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
				lockdowns${PRODUCTION ? '' : 'Staging'}(where: {
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
				roleStates${PRODUCTION ? '' : 'Staging'}(where: {
					guild: { _eq: $guild },
					member: { _eq: $member }
				}) {
					roles
				}
			}
		`,

		TAGS: gql`
			query($guild: String!) {
				tags${PRODUCTION ? '' : 'Staging'}(where: {
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
				tags${PRODUCTION ? '' : 'Staging'}(where: {
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
				tags${PRODUCTION ? '' : 'Staging'}(where: {
					guild: { _eq: $guild }
				}) {
					aliases
					content
					createdAt
					guild
					id
					lastModified
					name
					templated
					updatedAt
					user
					uses
				}
			}
		`,
	},

	MUTATION: {
		UPDATE_SETTINGS: gql`
			mutation($guild: String!, $settings: jsonb!) {
				insertSettings${PRODUCTION ? '' : 'Staging'}(
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
				deleteSettings${PRODUCTION ? '' : 'Staging'}(where: {
					guild: { _eq: $guild } }
				) {
					returning {
						guild
						settings
					}
				}
			}
		`,

		INSERT_ROLE_STATE: gql`
			mutation($objects: [${PRODUCTION ? '' : 'staging_'}role_states_insert_input!]!) {
				insertRoleStates${PRODUCTION ? '' : 'Staging'}(objects: $objects) {
					affected_rows
				}
			}
		`,

		DELETE_ROLE_STATE: gql`
			mutation($guild: String!) {
				deleteRoleStates${PRODUCTION ? '' : 'Staging'}(where: {
					guild: { _eq: $guild }
				}) {
					affected_rows
				}
			}
		`,

		DELETE_MEMBER_ROLE_STATE: gql`
			mutation($guild: String!, $member: String!) {
				deleteRoleStates${PRODUCTION ? '' : 'Staging'}(where: {
					guild: { _eq: $guild },
					member: { _eq: $member }
				}) {
					affected_rows
				}
			}
		`,

		UPDATE_ROLE_STATE: gql`
			mutation($guild: String!, $member: String!, $roles: _text!) {
				insertRoleStates${PRODUCTION ? '' : 'Staging'}(
					objects: { guild: $guild, member: $member, roles: $roles },
					on_conflict: { constraint: role_states_guild_member_key, update_columns: roles
				}) {
					affected_rows
				}
			}
		`,

		INSERT_CASES: gql`
			mutation(
				$action: Int!,
				$actionDuration: timestamptz,
				$actionProcessed: Boolean,
				$caseId: Int!,
				$guild: String!,
				$message: String,
				$muteMessage: String,
				$modId: String,
				$modTag: String,
				$reason: String,
				$refId: Int,
				$targetId: String,
				$targetTag: String
			) {
				insertCases${PRODUCTION ? '' : 'Staging'}(objects: {
					action: $action,
					actionDuration: $actionDuration,
					actionProcessed: $actionProcessed,
					caseId: $caseId,
					guild: $guild,
					message: $message,
					muteMessage: $muteMessage,
					modId: $modId,
					modTag: $modTag,
					reason: $reason,
					refId: $refId,
					targetId: $targetId,
					targetTag: $targetTag
				}) {
					returning {
						action
						actionDuration
						actionProcessed
						caseId
						createdAt
						guild
						id
						message
						muteMessage
						modId
						modTag
						reason
						refId
						targetId
						targetTag
					}
				}
			}
		`,

		LOG_CASE: gql`
			mutation($id: uuid!, $message: String!) {
				updateCases${PRODUCTION ? '' : 'Staging'}(where: {
					id: { _eq: $id }
				}, _set: { message: $message }) {
					affected_rows
				}
			}
		`,

		FIX_CASE: gql`
			mutation($id: uuid!, $caseId: Int!) {
				updateCases${PRODUCTION ? '' : 'Staging'}(where: {
					id: { _eq: $id }
				}, _set: { caseId: $caseId }) {
					affected_rows
				}
			}
		`,

		DELETE_CASE: gql`
			mutation($id: uuid!) {
				deleteCases${PRODUCTION ? '' : 'Staging'}(where: {
					id: { _eq: $id }
				}) {
					affected_rows
				}
			}
		`,

		CANCEL_MUTE: gql`
			mutation($id: uuid!, $actionProcessed: Boolean!) {
				updateCases${PRODUCTION ? '' : 'Staging'}(where: {
					id: { _eq: $id }
				}, _set: { actionProcessed: $actionProcessed }) {
					affected_rows
				}
			}
		`,

		UPDATE_DURATION_MUTE: gql`
			mutation($id: uuid!, $actionDuration: timestamptz!) {
				updateCases${PRODUCTION ? '' : 'Staging'}(where: {
					id: { _eq: $id }
				}, _set: { actionDuration: $actionDuration }) {
					returning {
						action
						actionDuration
						actionProcessed
						caseId
						createdAt
						guild
						id
						message
						modId
						modTag
						reason
						refId
						targetId
						targetTag
					}
				}
			}
		`,

		UPDATE_REASON: gql`
			mutation($id: uuid!, $modId: String!, $modTag: String!, $reason: String!) {
				updateCases${PRODUCTION ? '' : 'Staging'}(where: {
					id: { _eq: $id }
				}, _set: { modId: $modId, modTag: $modTag, reason: $reason }) {
					affected_rows
				}
			}
		`,

		INSERT_LOCKDOWNS: gql`
			mutation($guild: String!, $channel: String!, $duration: timestamptz!) {
				insertLockdowns${PRODUCTION ? '' : 'Staging'}(objects: {
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
				deleteLockdowns${PRODUCTION ? '' : 'Staging'}(where: {
					id: { _eq: $id }
				}) {
					affected_rows
				}
			}
		`,

		INSERT_TAG: gql`
			mutation($guild: String!, $user: String!, $name: String!, $hoisted: Boolean, $templated: Boolean, $content: String!) {
				insertTags${PRODUCTION ? '' : 'Staging'}(objects: {
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
			mutation($id: uuid!, $aliases: _text!, $lastModified: String!) {
				updateTags${PRODUCTION ? '' : 'Staging'}(where: {
					id: { _eq: $id }
				}, _set: { aliases: $aliases, lastModified: $lastModified }) {
					affected_rows
				}
			}
		`,

		UPDATE_TAG_CONTENT: gql`
			mutation($id: uuid!, $hoisted: Boolean, $templated: Boolean, $content: String!, $lastModified: String!) {
				updateTags${PRODUCTION ? '' : 'Staging'}(where: {
					id: { _eq: $id }
				}, _set: { hoisted: $hoisted, templated: $templated, content: $content, lastModified: $lastModified }) {
					affected_rows
				}
			}
		`,

		UPDATE_TAG_HOIST: gql`
			mutation($id: uuid!, $hoisted: Boolean, $templated: Boolean, $lastModified: String!) {
				updateTags${PRODUCTION ? '' : 'Staging'}(where: {
					id: { _eq: $id }
				}, _set: { hoisted: $hoisted, templated: $templated, lastModified: $lastModified }) {
					affected_rows
				}
			}
		`,

		UPDATE_TAG_USAGE: gql`
			mutation($id: uuid!, $uses: Int!) {
				updateTags${PRODUCTION ? '' : 'Staging'}(where: {
					id: { _eq: $id }
				}, _set: { uses: $uses }) {
					affected_rows
				}
			}
		`,

		DELETE_TAG: gql`
			mutation($id: uuid!) {
				deleteTags${PRODUCTION ? '' : 'Staging'}(where: {
					id: { _eq: $id }
				}) {
					affected_rows
				}
			}
		`,
	},
};

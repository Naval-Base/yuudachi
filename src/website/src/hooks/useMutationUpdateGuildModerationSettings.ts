import { useMutation, useQueryClient } from 'react-query';
import { fetchGraphQL } from '../util/fetchGraphQL';

import { GraphQLGuildModerationSettings, GuildModerationSettingsPayload } from '~/interfaces/GuildSettings';

export function useMutationUpdateGuildModerationSettings(id: string) {
	const cache = useQueryClient();

	return useMutation<GraphQLGuildModerationSettings, unknown, GuildModerationSettingsPayload>(
		(guildModerationSettings) =>
			fetchGraphQL(
				`mutation GuildModerationSettings($guild_id: String!, $_set: moderation_guild_settings_set_input) {
					guild: update_moderation_guild_settings_by_pk(pk_columns: {guild_id: $guild_id}, _set: $_set) {
						guild_id
					}
				}`,
				{ guild_id: id, _set: guildModerationSettings },
			).then(({ body }) => body),
		{
			onSuccess: ({ data }) => {
				void cache.invalidateQueries(['guilds', data.guild?.guild_id, 'settings', 'moderation']);
			},
		},
	);
}

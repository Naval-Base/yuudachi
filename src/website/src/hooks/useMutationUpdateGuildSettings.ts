import { useMutation, useQueryClient } from 'react-query';
import { fetchGraphQL } from '../util/fetchGraphQL';

import { GuildSettingsPayload, GraphQLGuildSettings, GuildModerationSettingsPayload } from '~/interfaces/GuildSettings';

export function useMutationUpdateGuildSettings(id: string) {
	const cache = useQueryClient();

	return useMutation<GraphQLGuildSettings, unknown, GuildSettingsPayload | GuildModerationSettingsPayload>(
		(guildSettings) =>
			fetchGraphQL(
				`mutation GuildSettings($guild_id: String!, $_set: guild_settings_set_input) {
					guild: update_guild_settings_by_pk(pk_columns: {guild_id: $guild_id}, _set: $_set) {
						tag_role_id
						repository_aliases
						reaction_role_id
						prefix
						mute_role_id
						mod_role_id
						mod_log_channel_id
						member_log_channel_id
						locale
						guild_log_channel_id
						emoji_role_id
						embed_role_id
						guild_id
						modules
					}
				}`,
				{ guild_id: id, _set: guildSettings },
			).then(({ body }) => body),
		{
			onSuccess: ({ data }) => {
				void cache.invalidateQueries(['guilds', data.guild?.guild_id, 'settings']);
			},
		},
	);
}

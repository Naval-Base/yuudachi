import { useMutation, useQueryClient } from 'react-query';
import { fetchGraphQL } from '../util/fetchGraphQL';

import {
	GuildSettingsPayload,
	GraphQLGuildSettings,
	GuildModerationSettingsPayload,
	GuildModulesPayload,
} from '~/interfaces/GuildSettings';

export function useMutationUpdateGuildSettings(id: string) {
	const cache = useQueryClient();

	return useMutation<
		GraphQLGuildSettings,
		unknown,
		GuildSettingsPayload | GuildModulesPayload | GuildModerationSettingsPayload
	>(
		(guildSettings) =>
			fetchGraphQL(
				`mutation GuildSettings($guild_id: String!, $_set: guild_settings_set_input) {
					guild: update_guild_settings_by_pk(pk_columns: {guild_id: $guild_id}, _set: $_set) {
						guild_id
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

import { useQuery, useQueryCache } from 'react-query';
import fetch from '../util/fetch';

import { Guild } from '../interfaces/Guild';

export function useQueryGuilds(loggedIn = false) {
	const cache = useQueryCache();

	return useQuery<{ guilds: Guild[] }>(
		'guilds',
		() => fetch('http://localhost:3500/api/guilds', { credentials: 'include' }).then(({ response }) => response.json()),
		{
			enabled: loggedIn,
			onSuccess: (data) => {
				data.guilds.forEach((guild) => cache.setQueryData(['guilds', guild.id], guild));
			},
		},
	);
}

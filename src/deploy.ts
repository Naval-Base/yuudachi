import { REST } from '@discordjs/rest';
import { Routes, Snowflake } from 'discord-api-types/v9';

import {
	// Moderation
	AntiRaidNukeCommand,
	BanCommand,
	DurationCommand,
	HistoryCommand,
	KickCommand,
	LockdownCommand,
	ReasonCommand,
	ReferenceCommand,
	RestrictCommand,
	SoftbanCommand,
	UnbanCommand,
	WarnCommand,

	// Utility
	PingCommand,
} from './interactions';

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN!);

try {
	console.log('Start refreshing interaction (/) commands');

	await rest.put(
		Routes.applicationGuildCommands(
			process.env.DISCORD_CLIENT_ID as Snowflake,
			process.env.DISCORD_GUILD_ID as Snowflake,
		),
		{
			body: [
				// Moderation
				AntiRaidNukeCommand,
				BanCommand,
				DurationCommand,
				HistoryCommand,
				KickCommand,
				ReasonCommand,
				ReferenceCommand,
				RestrictCommand,
				SoftbanCommand,
				UnbanCommand,
				WarnCommand,
				LockdownCommand,

				// Utility
				PingCommand,
			],
		},
	);

	console.log('Sucessfully reloaded interaction (/) commands.');
} catch (e) {
	console.error(e);
}

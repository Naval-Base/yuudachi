import { REST } from '@discordjs/rest';
import { Routes, Snowflake } from 'discord-api-types/v8';

import {
	AntiRaidNukeCommand,
	BanCommand,
	DurationCommand,
	HistoryCommand,
	KickCommand,
	LockdownCommand,
	PingCommand,
	ReasonCommand,
	ReferenceCommand,
	SoftbanCommand,
	UnbanCommand,
	WarnCommand,
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
				AntiRaidNukeCommand,
				BanCommand,
				DurationCommand,
				HistoryCommand,
				KickCommand,
				ReasonCommand,
				ReferenceCommand,
				SoftbanCommand,
				UnbanCommand,
				WarnCommand,
				PingCommand,
				LockdownCommand,
			],
		},
	);
	console.log('Sucessfully reloaded interaction (/) commands.');
} catch (e) {
	console.error(e);
}

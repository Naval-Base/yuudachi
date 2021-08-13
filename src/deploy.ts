import { REST } from '@discordjs/rest';
import {
	ApplicationCommandPermissionType,
	RESTGetAPIApplicationGuildCommandsResult,
	Routes,
	Snowflake,
} from 'discord-api-types/v9';

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

	// Context Menu
	HistoryContextMenuCommand,
} from './interactions';

// TODO: Remove after discord-api-types update
// Monkey patch type into APIApplicationCommand
declare module 'discord-api-types/v9' {
	export interface APIApplicationCommand {
		type: number;
	}
}

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN!);

try {
	console.log('Start refreshing interaction (/) commands.');

	const commands = (await rest.put(
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

				// Context Menu
				HistoryContextMenuCommand,
			],
		},
	)) as RESTGetAPIApplicationGuildCommandsResult;

	await rest.put(
		Routes.guildApplicationCommandsPermissions(
			process.env.DISCORD_CLIENT_ID as Snowflake,
			process.env.DISCORD_GUILD_ID as Snowflake,
		),
		{
			body: commands.map((cmd) => ({
				id: cmd.id,
				permissions: [
					{
						id: process.env.DISCORD_USER_ID as Snowflake,
						type: ApplicationCommandPermissionType.User,
						permission: true,
					},
					{
						id: process.env.DISCORD_MOD_ROLE_ID as Snowflake,
						type: ApplicationCommandPermissionType.Role,
						permission: true,
					},
				],
			})),
		},
	);

	console.log('Successfully reloaded interaction (/) commands.');
} catch (e) {
	console.error(e);
}

import { REST } from '@discordjs/rest';
import {
	ApplicationCommandPermissionType,
	type RESTGetAPIApplicationGuildCommandsResult,
	Routes,
} from 'discord-api-types/v10';

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
	TimeoutCommand,

	// Utility
	PingCommand,
	CheckScamCommand,
	RefreshScamlistCommand,

	// Context Menu
	HistoryContextMenuCommand,
} from './interactions/index.js';

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN!);

try {
	console.log('Start refreshing interaction (/) commands.');

	const commands = (await rest.put(
		Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID!, process.env.DISCORD_GUILD_ID!),
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
				TimeoutCommand,

				// Utility
				PingCommand,
				CheckScamCommand,
				RefreshScamlistCommand,

				// Context Menu
				HistoryContextMenuCommand,
			],
		},
	)) as RESTGetAPIApplicationGuildCommandsResult;

	await rest.put(
		Routes.guildApplicationCommandsPermissions(process.env.DISCORD_CLIENT_ID!, process.env.DISCORD_GUILD_ID!),
		{
			body: commands.map((cmd) => ({
				id: cmd.id,
				permissions: [
					{
						id: process.env.DISCORD_USER_ID!,
						type: ApplicationCommandPermissionType.User,
						permission: true,
					},
					{
						id: process.env.DISCORD_MOD_ROLE_ID!,
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

import process from "node:process";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import {
	// Moderation
	AntiRaidNukeCommand,
	CaseLookupCommand,
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
	ClearCommand,

	// Utility
	PingCommand,
	CheckScamCommand,
	RefreshScamlistCommand,
	SponsorCommand,
	RepostCommand,

	// Context Menu
	HistoryUserContextCommand,
	SponsorUserContextCommand,
	RepostMessageContextCommand,
	ClearContextCommand,
} from "./interactions/index.js";

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN!);

try {
	console.log("Start refreshing interaction (/) commands.");

	await rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID!, process.env.DISCORD_GUILD_ID!), {
		body: [
			// Moderation
			AntiRaidNukeCommand,
			BanCommand,
			CaseLookupCommand,
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
			ClearCommand,

			// Utility
			PingCommand,
			CheckScamCommand,
			RefreshScamlistCommand,
			SponsorCommand,
			RepostCommand,

			// Context Menu
			HistoryUserContextCommand,
			SponsorUserContextCommand,
			RepostMessageContextCommand,
			ClearContextCommand,
		],
	});
	console.log("Successfully reloaded interaction (/) commands.");
} catch (error) {
	console.error(error);
}

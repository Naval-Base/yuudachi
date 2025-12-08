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
	SoftbanCommand,
	UnbanCommand,
	WarnCommand,
	TimeoutCommand,
	ClearCommand,
	ReportUtilsCommand,

	// Utility
	PingCommand,
	CheckScamCommand,
	RefreshScamlistCommand,
	SponsorCommand,
	ReportCommand,
	ClaimSponsorCommand,

	// Context Menu
	HistoryUserContextCommand,
	SponsorUserContextCommand,
	ClearContextCommand,
	ReportMessageContextCommand,
	ReportUserContextCommand,
} from "./interactions/index.js";

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN!);

try {
	console.log("Start refreshing interaction (/) commands.");

	await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!), {
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
			SoftbanCommand,
			UnbanCommand,
			WarnCommand,
			LockdownCommand,
			TimeoutCommand,
			ClearCommand,
			ReportUtilsCommand,

			// Utility
			PingCommand,
			CheckScamCommand,
			RefreshScamlistCommand,
			SponsorCommand,
			ReportCommand,
			ClaimSponsorCommand,

			// Context Menu
			HistoryUserContextCommand,
			SponsorUserContextCommand,
			ClearContextCommand,
			ReportMessageContextCommand,
			ReportUserContextCommand,
		],
	});

	await rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID!, process.env.DISCORD_GUILD_ID!), {
		body: [
			// Utility
			SponsorCommand,
			ClaimSponsorCommand,

			// Context Menu
			SponsorUserContextCommand,
		],
	});

	console.log("Successfully reloaded interaction (/) commands.");
} catch (error) {
	console.error(error);
}

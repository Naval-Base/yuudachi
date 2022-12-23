import "reflect-metadata";
import process from "node:process";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { formatCommandToLocalizations } from "./functions/commandsLocalization/resolve.js";
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
	ReportUtilsCommand,

	// Utility
	PingCommand,
	CheckScamCommand,
	RefreshScamlistCommand,
	SponsorCommand,
	RepostCommand,
	ReportCommand,
	ClaimSponsorCommand,

	// Context Menu
	HistoryUserContextCommand,
	SponsorUserContextCommand,
	RepostMessageContextCommand,
	ClearContextCommand,
	ReportMessageContextCommand,
	ReportUserContextCommand,
} from "./interactions/index.js";
import { createI18next } from "./util/i18next.js";

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN!);

await createI18next();

try {
	console.log("Start refreshing interaction (/) commands.");

	const moderation = [
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
		ReportUtilsCommand,
	].map((command) => formatCommandToLocalizations("moderation", command as any));

	const utility = [
		PingCommand,
		CheckScamCommand,
		RefreshScamlistCommand,
		SponsorCommand,
		RepostCommand,
		ReportCommand,
		ClaimSponsorCommand,
	].map((command) => formatCommandToLocalizations("utility", command as any));

	const contextMenu = [
		HistoryUserContextCommand,
		SponsorUserContextCommand,
		RepostMessageContextCommand,
		ClearContextCommand,
		ReportMessageContextCommand,
		ReportUserContextCommand,
	].map((command) => formatCommandToLocalizations("context-menu", command as any));

	await rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID!, process.env.DISCORD_GUILD_ID!), {
		body: [...moderation, ...utility, ...contextMenu],
	});
	console.log("Successfully reloaded interaction (/) commands.");
} catch (error) {
	console.error(error);
}

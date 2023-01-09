import type { Guild, Snowflake } from "discord.js";

export async function resolveGuildCommand(guild: Guild, commandName: string) {
	const guildCommands = guild.commands.cache.size ? guild.commands.cache : await guild.commands.fetch();

	const command = guildCommands.find((command) => command.name === commandName.toLowerCase());

	if (!command) {
		return null;
	}

	return command;
}

/**
 * **Polyfill for chatInput commands, this should be imported from discord.js when available**
 *
 * Formats an application command name, subcommand group name, subcommand name, and ID into an application command mention
 *
 * @param commandName - The application command name to format
 * @param commandId - The application command ID to format
 */
export function chatInputApplicationCommandMention<N extends string, G extends Snowflake | string>(
	commandName: N,
	commandId: G,
): `</${N}:${G}>` {
	return `</${commandName}:${commandId}>`;
}

import { SlashCommandBuilder } from '@discordjs/builders';

export const HistoryCommand = new SlashCommandBuilder()
	.setName('history')
	.setDescription('Look up a users moderative history')
	.addUserOption((opt) => opt.setName('user').setDescription('The user to look up').setRequired(true))
	.addBooleanOption((opt) => opt.setName('hide').setDescription('Hides the output').setRequired(false));

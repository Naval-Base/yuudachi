import { SlashCommandBuilder } from '@discordjs/builders';

export const ReasonCommand = new SlashCommandBuilder()
	.setName('reason')
	.setDescription('Change the reason of an action')
	.addIntegerOption((opt) => opt.setName('case').setDescription('The case to look up').setRequired(true))
	.addStringOption((opt) => opt.setName('reason').setDescription('The reason').setRequired(true));

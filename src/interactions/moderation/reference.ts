import { SlashCommandBuilder } from '@discordjs/builders';

export const ReferenceCommand = new SlashCommandBuilder()
	.setName('reference')
	.setDescription('Change the reference of an action')
	.addIntegerOption((opt) => opt.setName('case').setDescription('The case to look up').setRequired(true))
	.addIntegerOption((opt) => opt.setName('reference').setDescription('The reference case').setRequired(true));

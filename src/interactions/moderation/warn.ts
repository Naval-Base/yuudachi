import { SlashCommandBuilder } from '@discordjs/builders';

export const WarnCommand = new SlashCommandBuilder()
	.setName('warn')
	.setDescription('Warn a user')
	.addUserOption((opt) => opt.setName('user').setDescription('The user to action').setRequired(true))
	.addStringOption((opt) => opt.setName('reason').setDescription('The reason of this action').setRequired(false))
	.addIntegerOption((opt) => opt.setName('reference').setDescription('The reference case').setRequired(false));

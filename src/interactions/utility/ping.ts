import { SlashCommandBuilder } from '@discordjs/builders';

export const PingCommand = new SlashCommandBuilder()
	.setName('ping')
	.setDescription('Health check')
	.addBooleanOption((opt) => opt.setName('hide').setDescription('Hides the output'));

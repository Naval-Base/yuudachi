import { SlashCommandBuilder } from '@discordjs/builders';

export const DurationCommand = new SlashCommandBuilder()
	.setName('duration')
	.setDescription('Change the duration of a timed action')
	.addIntegerOption((opt) => opt.setName('case').setDescription('The case to look up').setRequired(true))
	.addStringOption((opt) =>
		opt
			.setName('duration')
			.setDescription('The duration')
			.setRequired(true)
			.addChoices([
				['3 hours', '3h'],
				['6 hours', '6h'],
				['12 hours', '12h'],
				['1 day', '1d'],
				['2 days', '2d'],
				['3 days', '3d'],
				['7 days', '7d'],
			]),
	);

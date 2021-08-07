import { SlashCommandBuilder } from '@discordjs/builders';

export const SoftbanCommand = new SlashCommandBuilder()
	.setName('softban')
	.setDescription('Softban a member of(f) this guild')
	.addUserOption((opt) => opt.setName('user').setDescription('The user to action').setRequired(true))
	.addStringOption((opt) => opt.setName('reason').setDescription('The reason of this action').setRequired(false))
	.addIntegerOption((opt) =>
		opt
			.setName('days')
			.setDescription('The amount of days to deleted messages from')
			.setRequired(false)
			.addChoices([
				['0 days', 0],
				['1 day (default)', 1],
				['2 days', 2],
				['3 days', 3],
				['4 days', 4],
				['5 days', 5],
				['6 days', 6],
				['7 days', 7],
			]),
	)
	.addIntegerOption((opt) => opt.setName('reference').setDescription('The reference case').setRequired(false));

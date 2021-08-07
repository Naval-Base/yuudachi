import { SlashCommandBuilder } from '@discordjs/builders';

export const AntiRaidNukeCommand = new SlashCommandBuilder()
	.setName('anti-raid-nuke')
	.setDescription('Bans all members that have joined recently, with new accounts')
	.addStringOption((opt) =>
		opt
			.setName('join')
			.setDescription('How old should a member be for the cybernuke to ignore them (server join date)?')
			.setRequired(true),
	)
	.addStringOption((opt) =>
		opt
			.setName('age')
			.setDescription("How old should a member's account be for the cybernuke to ignore them (account age)?")
			.setRequired(true),
	)
	.addStringOption((opt) => opt.setName('reason').setDescription('The reason of this action').setRequired(false))
	.addIntegerOption((opt) =>
		opt
			.setName('days')
			.setDescription('The amount of days to deleted messages from')
			.setRequired(false)
			.addChoices([
				['0 days (default)', 0],
				['1 day', 1],
				['2 days', 2],
				['3 days', 3],
				['4 days', 4],
				['5 days', 5],
				['6 days', 6],
				['7 days', 7],
			]),
	);

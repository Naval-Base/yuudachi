import { SlashCommandBuilder } from '@discordjs/builders';

export const RestrictCommand = new SlashCommandBuilder()
	.setName('restrict')
	.setDescription('Restrict a members access to write/tags/embed/react/emoji')
	.addSubcommand((sub) =>
		sub
			.setName('mute')
			.setDescription('Mute a member of(f) this guild')
			.addUserOption((opt) => opt.setName('user').setDescription('The user to action').setRequired(true))
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
			)
			.addStringOption((opt) => opt.setName('reason').setDescription('The reason of this action').setRequired(false))
			.addIntegerOption((opt) => opt.setName('reference').setDescription('The reference case').setRequired(false)),
	)
	.addSubcommand((sub) =>
		sub
			.setName('embed')
			.setDescription('Embed restrict a member of(f) this guild')
			.addUserOption((opt) => opt.setName('user').setDescription('The user to action').setRequired(true))
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
			)
			.addStringOption((opt) => opt.setName('reason').setDescription('The reason of this action').setRequired(false))
			.addIntegerOption((opt) => opt.setName('reference').setDescription('The reference case').setRequired(false)),
	)
	.addSubcommand((sub) =>
		sub
			.setName('react')
			.setDescription('Reaction restrict a member of(f) this guild')
			.addUserOption((opt) => opt.setName('user').setDescription('The user to action').setRequired(true))
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
			)
			.addStringOption((opt) => opt.setName('reason').setDescription('The reason of this action').setRequired(false))
			.addIntegerOption((opt) => opt.setName('reference').setDescription('The reference case').setRequired(false)),
	)
	.addSubcommand((sub) =>
		sub
			.setName('emoji')
			.setDescription('Emoji restrict a member of(f) this guild')
			.addUserOption((opt) => opt.setName('user').setDescription('The user to action').setRequired(true))
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
			)
			.addStringOption((opt) => opt.setName('reason').setDescription('The reason of this action').setRequired(false))
			.addIntegerOption((opt) => opt.setName('reference').setDescription('The reference case').setRequired(false)),
	)
	.addSubcommand((sub) =>
		sub
			.setName('unrole')
			.setDescription('Unrole a specific case')
			.addIntegerOption((opt) => opt.setName('case').setDescription('The case to unrole').setRequired(true)),
	);

import { SlashCommandBuilder } from '@discordjs/builders';

export const LockdownCommand = new SlashCommandBuilder()
	.setName('lockdown')
	.setDescription('Execute or lift a lockdown on a text channel')
	.addSubcommand((sub) =>
		sub
			.setName('lock')
			.setDescription('Execute a lockdown on a text channel')
			.addStringOption((opt) =>
				opt
					.setName('duration')
					.setDescription('The duration')
					.setRequired(true)
					.addChoices([
						['1 hour', '1h'],
						['3 hours', '3h'],
						['6 hours', '6h'],
						['12 hours', '12h'],
						['1 day', '1d'],
						['2 days', '2d'],
						['3 days', '3d'],
					]),
			)
			.addChannelOption((opt) => opt.setName('channel').setDescription('The channel to lock').setRequired(false))
			.addStringOption((opt) => opt.setName('reason').setDescription('The reason of this lockdown').setRequired(false)),
	)
	.addSubcommand((sub) =>
		sub
			.setName('lift')
			.setDescription('Lift a lockdown on a text channel')
			.addChannelOption((opt) =>
				opt.setName('channel').setDescription('The channel to lift the lock').setRequired(false),
			),
	);

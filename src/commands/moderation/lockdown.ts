import type { CommandInteraction, TextChannel } from 'discord.js';
import i18next from 'i18next';

import type { ArgumentsOf } from '../../interactions/ArgumentsOf';
import type { Command } from '../../Command';
import type { LockdownCommand } from '../../interactions';
import { checkModRole } from '../../functions/permissions/checkModRole';

import { lock } from './sub/lockdown/lock';
import { lift } from './sub/lockdown/lift';

export default class implements Command {
	public async execute(
		interaction: CommandInteraction,
		args: ArgumentsOf<typeof LockdownCommand>,
		locale: string,
	): Promise<void> {
		await interaction.deferReply({ ephemeral: true });
		await checkModRole(interaction, locale);

		switch (Object.keys(args)[0]) {
			case 'lock': {
				if (args.lock.channel && !args.lock.channel.isText()) {
					throw new Error(
						i18next.t('command.mod.common.errors.not_a_text_channel', {
							channel: `${args.lock.channel.toString()} - ${args.lock.channel.name} (${args.lock.channel.id})`,
							lng: locale,
						}),
					);
				}

				const reason = args.lock.reason;
				if (reason && reason.length >= 1900) {
					throw new Error(i18next.t('command.mod.common.errors.max_length_reason', { lng: locale }));
				}

				return lock(
					interaction,
					{ channel: (args.lock.channel ?? interaction.channel) as TextChannel, duration: args.lock.duration, reason },
					locale,
				);
			}

			case 'lift': {
				if (args.lift.channel && !args.lift.channel.isText()) {
					throw new Error(
						i18next.t('command.mod.common.errors.not_a_text_channel', {
							channel: `${args.lift.channel.toString()} - ${args.lift.channel.name} (${args.lift.channel.id})`,
							lng: locale,
						}),
					);
				}

				return lift(interaction, (args.lift.channel ?? interaction.channel) as TextChannel, locale);
			}
		}
	}
}

import { PermissionFlagsBits } from 'discord-api-types/v9';
import type { BaseCommandInteraction, TextChannel } from 'discord.js';
import i18next from 'i18next';
import { lift } from './sub/lockdown/lift';
import { lock } from './sub/lockdown/lock';
import type { Command } from '../../Command';
import { checkModRole } from '../../functions/permissions/checkModRole';
import type { LockdownCommand } from '../../interactions';
import type { ArgumentsOf } from '../../interactions/ArgumentsOf';

export default class implements Command {
	public async execute(
		interaction: BaseCommandInteraction<'cached'>,
		args: ArgumentsOf<typeof LockdownCommand>,
		locale: string,
	): Promise<void> {
		const reply = await interaction.deferReply({ ephemeral: true, fetchReply: true });
		await checkModRole(interaction, locale);

		if (!interaction.guild.me?.permissions.has(PermissionFlagsBits.Administrator)) {
			throw new Error(
				i18next.t('command.mod.lockdown.lock.errors.bot_requires_admin', {
					lng: locale,
				}),
			);
		}

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

				const targetChannel = (args.lock.channel ?? interaction.channel) as TextChannel;
				const targetChannelClientPermissions = targetChannel.permissionsFor(interaction.client.user!);

				if (
					!targetChannelClientPermissions?.has([PermissionFlagsBits.ManageRoles | PermissionFlagsBits.ManageChannels])
				) {
					throw new Error(
						i18next.t('command.mod.lockdown.lock.errors.missing_permissions', {
							// eslint-disable-next-line @typescript-eslint/no-base-to-string
							channel: targetChannel.toString(),
							lng: locale,
						}),
					);
				}

				return lock(
					interaction,
					reply,
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

				return lift(interaction, reply, (args.lift.channel ?? interaction.channel) as TextChannel, locale);
			}
		}
	}
}

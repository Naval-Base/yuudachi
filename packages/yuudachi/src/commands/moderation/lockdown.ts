import { type TextChannel, ChannelType, PermissionFlagsBits } from "discord.js";
import i18next from "i18next";
import { type ArgsParam, Command, type InteractionParam, type LocaleParam } from "../../Command.js";
import type { LockdownCommand } from "../../interactions/index.js";
import { lift } from "./sub/lockdown/lift.js";
import { lock } from "./sub/lockdown/lock.js";

export default class extends Command<typeof LockdownCommand> {
	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<typeof LockdownCommand>,
		locale: LocaleParam,
	): Promise<void> {
		const reply = await interaction.deferReply({ ephemeral: true });

		if (!interaction.guild.members.me?.permissions.has(PermissionFlagsBits.Administrator)) {
			throw new Error(
				i18next.t("command.mod.lockdown.lock.errors.bot_requires_admin", {
					lng: locale,
				}),
			);
		}

		switch (Object.keys(args)[0]) {
			case "lock": {
				if (args.lock.channel && args.lock.channel.type === ChannelType.GuildText) {
					throw new Error(
						i18next.t("command.mod.common.errors.not_a_text_channel", {
							channel: `${args.lock.channel.toString()} - ${args.lock.channel.name} (${args.lock.channel.id})`,
							lng: locale,
						}),
					);
				}

				const reason = args.lock.reason;

				if (reason && reason.length >= 1_900) {
					throw new Error(i18next.t("command.mod.common.errors.max_length_reason", { lng: locale }));
				}

				const targetChannel = (args.lock.channel ?? interaction.channel) as TextChannel;
				const targetChannelClientPermissions = targetChannel.permissionsFor(interaction.client.user!);

				if (
					!targetChannelClientPermissions?.has([PermissionFlagsBits.ManageRoles | PermissionFlagsBits.ManageChannels])
				) {
					throw new Error(
						i18next.t("command.mod.lockdown.lock.errors.missing_permissions", {
							// eslint-disable-next-line @typescript-eslint/no-base-to-string
							channel: `${targetChannel.toString()} - ${targetChannel.name} (${targetChannel.id})`,
							lng: locale,
						}),
					);
				}

				await lock(
					interaction,
					reply,
					{ channel: (args.lock.channel ?? interaction.channel) as TextChannel, duration: args.lock.duration, reason },
					locale,
				);
				break;
			}

			case "lift": {
				if (args.lift.channel && args.lift.channel.type !== ChannelType.GuildText) {
					throw new Error(
						i18next.t("command.mod.common.errors.not_a_text_channel", {
							channel: `${args.lift.channel.toString()} - ${args.lift.channel.name} (${args.lift.channel.id})`,
							lng: locale,
						}),
					);
				}

				await lift(interaction, reply, (args.lift.channel ?? interaction.channel) as TextChannel, locale);
				break;
			}

			default:
				break;
		}
	}
}

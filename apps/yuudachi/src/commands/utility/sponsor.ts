import { injectable } from "@needle-di/core";
import { kSQL, Command, createButton, createMessageActionRow, container } from "@yuudachi/framework";
import type { ArgsParam, InteractionParam, LocaleParam, CommandMethod } from "@yuudachi/framework/types";
import { type Snowflake, ButtonStyle, ComponentType } from "discord.js";
import i18next from "i18next";
import { nanoid } from "nanoid";
import type { Sql } from "postgres";
import type { SponsorCommand, SponsorUserContextCommand } from "../../interactions/index.js";

@injectable()
export default class extends Command<typeof SponsorCommand | typeof SponsorUserContextCommand> {
	public constructor() {
		super(["sponsor", "Assign sponsor"]);
	}

	private async handle(
		interaction: InteractionParam | InteractionParam<CommandMethod.UserContext>,
		args: ArgsParam<typeof SponsorCommand>,
		locale: LocaleParam,
	): Promise<void> {
		const reply = await interaction.deferReply({ ephemeral: true });

		const sql = container.get<Sql<any>>(kSQL);

		const [roles] = await sql<[{ sponsor_role_id: Snowflake | null }?]>`
			select sponsor_role_id
			from guild_settings
			where guild_id = ${interaction.guildId}
		`;

		if (!roles?.sponsor_role_id) {
			throw new Error(i18next.t("command.utility.sponsor.errors.no_role", { lng: locale }));
		}

		if (args.user.member?.roles.cache.has(roles.sponsor_role_id)) {
			throw new Error(
				i18next.t("command.utility.sponsor.errors.already_sponsor", {
					user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
					lng: locale,
				}),
			);
		}

		const sponsorKey = nanoid();
		const cancelKey = nanoid();

		const roleButton = createButton({
			label: i18next.t("command.utility.sponsor.buttons.execute", { lng: locale }),
			customId: sponsorKey,
			style: ButtonStyle.Success,
		});
		const cancelButton = createButton({
			label: i18next.t("command.common.buttons.cancel", { lng: locale }),
			customId: cancelKey,
			style: ButtonStyle.Secondary,
		});

		await interaction.editReply({
			content: i18next.t("command.utility.sponsor.pending", {
				user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
				lng: locale,
			}),
			components: [createMessageActionRow([cancelButton, roleButton])],
		});

		const collectedInteraction = await reply
			.awaitMessageComponent({
				filter: (collected) => collected.user.id === interaction.user.id,
				componentType: ComponentType.Button,
				time: 15_000,
			})
			.catch(async () => {
				try {
					await interaction.editReply({
						content: i18next.t("command.common.errors.timed_out", { lng: locale }),
						components: [],
					});
				} catch {}

				return undefined;
			});

		if (collectedInteraction?.customId === cancelKey) {
			await collectedInteraction.update({
				content: i18next.t("command.utility.sponsor.cancel", {
					user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
					lng: locale,
				}),
				components: [],
			});
		} else if (collectedInteraction?.customId === sponsorKey) {
			await collectedInteraction.deferUpdate();

			await args.user.member?.roles.add(
				roles.sponsor_role_id,
				i18next.t("command.utility.sponsor.reason", { lng: locale }),
			);

			await collectedInteraction.editReply({
				content: i18next.t("command.utility.sponsor.success", {
					user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
					lng: locale,
				}),
				components: [],
			});
		}
	}

	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<typeof SponsorCommand>,
		locale: LocaleParam,
	): Promise<void> {
		await this.handle(interaction, args, locale);
	}

	public override async userContext(
		interaction: InteractionParam<CommandMethod.UserContext>,
		args: ArgsParam<typeof SponsorUserContextCommand>,
		locale: LocaleParam,
	): Promise<void> {
		await this.handle(interaction, args, locale);
	}
}

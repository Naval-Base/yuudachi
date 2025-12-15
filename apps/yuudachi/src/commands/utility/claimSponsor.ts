import { injectable } from "@needle-di/core";
import { kSQL, Command, createButton, createMessageActionRow, container } from "@yuudachi/framework";
import type { ArgsParam, InteractionParam, LocaleParam } from "@yuudachi/framework/types";
import { type Snowflake, ButtonStyle, ComponentType, MessageFlags } from "discord.js";
import i18next from "i18next";
import { nanoid } from "nanoid";
import type { Sql } from "postgres";
import { request as fetch } from "undici";
import type { ClaimSponsorCommand } from "../../interactions/index.js";

@injectable()
export default class extends Command<typeof ClaimSponsorCommand> {
	public constructor() {
		super(["claim-sponsor"]);
	}

	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<typeof ClaimSponsorCommand>,
		locale: LocaleParam,
	): Promise<void> {
		const reply = await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const sql = container.get<Sql<any>>(kSQL);

		const [roles] = await sql<[{ sponsor_role_id: Snowflake | null }?]>`
			select sponsor_role_id
			from guild_settings
			where guild_id = ${interaction.guildId}
		`;

		if (!roles?.sponsor_role_id) {
			throw new Error(i18next.t("command.utility.claim_sponsor.errors.no_role", { lng: locale }));
		}

		if (interaction.member?.roles.cache.has(roles.sponsor_role_id)) {
			throw new Error(
				i18next.t("command.utility.claim_sponsor.errors.already_sponsor", {
					guild: interaction.guild.name,
					lng: locale,
				}),
			);
		}

		const sponsorKey = nanoid();
		const cancelKey = nanoid();

		const roleButton = createButton({
			label: i18next.t("command.utility.claim_sponsor.buttons.execute", { lng: locale }),
			customId: sponsorKey,
			style: ButtonStyle.Success,
		});
		const cancelButton = createButton({
			label: i18next.t("command.common.buttons.cancel", { lng: locale }),
			customId: cancelKey,
			style: ButtonStyle.Secondary,
		});

		await interaction.editReply({
			content: i18next.t("command.utility.claim_sponsor.pending", {
				guild: interaction.guild.name,
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
				content: i18next.t("command.utility.claim_sponsor.cancel", {
					guild: interaction.guild.name,
					lng: locale,
				}),
				components: [],
			});
		} else if (collectedInteraction?.customId === sponsorKey) {
			await collectedInteraction.deferUpdate();

			const res = await fetch(process.env.OPEN_COLLECTIVE_URL!, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Api-Key": process.env.OPEN_COLLECTIVE_API_KEY,
				},
				body: JSON.stringify({
					query: `query {
						account(slug: "${process.env.OPEN_COLLECTIVE_ORG}") {
							id
							name
							slug
								transactions(fromAccount: { slug: "${args.slug}" }, kind: CONTRIBUTION, limit: 1) {
									nodes {
										id
										kind
										fromAccount {
											id
											slug
											tags
										}
									}
								}
							}
						}`,
				}),
			});
			const data = (await res.body.json()) as any;

			if (!data?.data?.account) {
				throw new Error(i18next.t("command.utility.claim_sponsor.errors.no_oc_user", { slug: args.slug, lng: locale }));
			}

			if (!data.data.account.transactions.nodes.length) {
				throw new Error(
					i18next.t("command.utility.claim_sponsor.errors.no_oc_sponsor", { slug: args.slug, lng: locale }),
				);
			}

			const transaction = data.data.account.transactions.nodes[0];
			const discordId = transaction.fromAccount.tags?.find((tag: string) => /^\d{17,20}$/.test(tag));
			if (!discordId) {
				throw new Error(i18next.t("command.utility.claim_sponsor.errors.no_oc_tag", { lng: locale }));
			}

			if (interaction.user.id !== discordId) {
				throw new Error(i18next.t("command.utility.claim_sponsor.errors.oc_id_mismatch", { lng: locale }));
			}

			await interaction.member?.roles.add(
				roles.sponsor_role_id,
				i18next.t("command.utility.claim_sponsor.reason", { lng: locale }),
			);

			await collectedInteraction.editReply({
				content: i18next.t("command.utility.claim_sponsor.success", {
					guild: interaction.guild.name,
					lng: locale,
				}),
				components: [],
			});
		}
	}
}

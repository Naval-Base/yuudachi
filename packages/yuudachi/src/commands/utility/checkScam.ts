import { Command, addFields, truncateEmbed } from "@yuudachi/framework";
import type { ArgsParam, InteractionParam, LocaleParam } from "@yuudachi/framework/types";
import i18next from "i18next";
import { Color } from "../../Constants.js";
import { checkScam } from "../../functions/anti-scam/checkScam.js";
import type { CheckScamCommand } from "../../interactions/index.js";

export default class extends Command<typeof CheckScamCommand> {
	public constructor() {
		super(["check-scam"]);
	}

	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<typeof CheckScamCommand>,
		locale: LocaleParam,
	): Promise<void> {
		await interaction.deferReply({ ephemeral: args.hide ?? true });

		const domains = await checkScam(args.content);

		let embed = addFields({
			color: domains.length ? Color.DiscordDanger : Color.DiscordSuccess,
			description: args.content,
		});

		if (domains.length) {
			embed = addFields(embed, {
				name: i18next.t("command.utility.check_scam.found", { count: domains.length, lng: locale }),
				value: domains.map((domain) => `• \`${domain.host}\` on lists: \`[${domain.lists.join(",")}]\``).join("\n"),
			});
		}

		await interaction.editReply({ embeds: [truncateEmbed(embed)] });
	}
}

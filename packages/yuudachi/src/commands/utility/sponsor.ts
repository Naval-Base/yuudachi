import { type CommandInteraction, type Snowflake, ButtonStyle, ComponentType } from 'discord.js';
import i18next from 'i18next';
import { nanoid } from 'nanoid';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';
import type { Command } from '../../Command.js';
import type { ArgumentsOf } from '../../interactions/ArgumentsOf.js';
import type { SponsorCommand } from '../../interactions/index.js';
import { kSQL } from '../../tokens.js';
import { createButton } from '../../util/button.js';
import { createMessageActionRow } from '../../util/messageActionRow.js';

export default class implements Command {
	public async execute(
		interaction: CommandInteraction<'cached'>,
		args: ArgumentsOf<typeof SponsorCommand>,
		locale: string,
	): Promise<void> {
		const reply = await interaction.deferReply({ ephemeral: true });

		const sql = container.resolve<Sql<any>>(kSQL);

		const [roles] = await sql<[{ sponsor_role_id: Snowflake | null }?]>`
			select sponsor_role_id
			from guild_settings
			where guild_id = ${interaction.guildId}`;

		if (!roles?.sponsor_role_id) {
			throw new Error(i18next.t('command.utility.sponsor.errors.no_role', { lng: locale }));
		}

		if (args.user.member?.roles.cache.has(roles.sponsor_role_id)) {
			throw new Error(
				i18next.t('command.utility.sponsor.errors.already_sponsor', {
					user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
					lng: locale,
				}),
			);
		}

		const sponsorKey = nanoid();
		const cancelKey = nanoid();

		const roleButton = createButton({
			customId: sponsorKey,
			label: i18next.t('command.utility.sponsor.buttons.execute', { lng: locale }),
			style: ButtonStyle.Success,
		});
		const cancelButton = createButton({
			customId: cancelKey,
			label: i18next.t('command.common.buttons.cancel', { lng: locale }),
			style: ButtonStyle.Secondary,
		});

		await interaction.editReply({
			content: i18next.t('command.utility.sponsor.pending', {
				user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
				lng: locale,
			}),
			components: [createMessageActionRow([cancelButton, roleButton])],
		});

		const collectedInteraction = await reply
			.awaitMessageComponent({
				filter: (collected) => collected.user.id === interaction.user.id,
				componentType: ComponentType.Button,
				time: 15000,
			})
			.catch(async () => {
				try {
					await interaction.editReply({
						content: i18next.t('command.common.errors.timed_out', { lng: locale }),
						components: [],
					});
				} catch {}
				return undefined;
			});

		if (collectedInteraction?.customId === cancelKey) {
			await collectedInteraction.update({
				content: i18next.t('command.utility.sponsor.cancel', {
					user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
					lng: locale,
				}),
				components: [],
			});
		} else if (collectedInteraction?.customId === sponsorKey) {
			await collectedInteraction.deferUpdate();

			await args.user.member?.roles.add(
				roles.sponsor_role_id,
				i18next.t('command.utility.sponsor.reason', { lng: locale }),
			);

			await collectedInteraction.editReply({
				content: i18next.t('command.utility.sponsor.success', {
					user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
					lng: locale,
				}),
				components: [],
			});
		}
	}
}

import type { APIEmbed } from 'discord-api-types/v8';
import type { ButtonInteraction, CommandInteraction, SelectMenuInteraction, Snowflake, TextChannel } from 'discord.js';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';

import { kSQL } from '../tokens';
import type { Case } from './createCase';
import { generateCaseLog } from './generateCaseLog';
import { getGuildSetting, SettingsKeys } from './getGuildSetting';

export async function upsertCaseLog(
	interaction: CommandInteraction | ButtonInteraction | SelectMenuInteraction,
	case_: Case,
) {
	const sql = container.resolve<Sql<any>>(kSQL);

	const logChannelId: Snowflake = await getGuildSetting(case_.guildId, SettingsKeys.ModLogChannelId)!;
	const logChannel = interaction.client.channels.cache.get(logChannelId) as TextChannel;

	const embed: APIEmbed = {
		author: {
			name: `${interaction.user.tag} (${interaction.user.id})`,
			icon_url: interaction.user.displayAvatarURL(),
		},
		description: await generateCaseLog(interaction, case_, logChannelId),
		footer: {
			text: `Case ${case_.caseId}`,
		},
		timestamp: new Date().toISOString(),
	};

	if (case_.logMessageId) {
		const message = await logChannel.messages.fetch(case_.logMessageId);
		await message.edit({
			// @ts-expect-error
			embeds: [embed],
		});
	} else {
		const logMessage = await logChannel.send({
			// @ts-expect-error
			embeds: [embed],
		});

		await sql`update cases
			set log_message_id = ${logMessage.id}
			where guild_id = ${case_.guildId}
				and case_id = ${case_.caseId}`;
	}
}

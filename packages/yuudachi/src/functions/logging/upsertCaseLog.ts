import { Client, Snowflake, User } from 'discord.js';

import type { Sql } from 'postgres';
import { container } from 'tsyringe';
import { generateCaseEmbed } from './generateCaseEmbed.js';
import { kSQL } from '../../tokens.js';
import type { Case } from '../cases/createCase.js';
import { checkLogChannel } from '../settings/checkLogChannel.js';
import { getGuildSetting, SettingsKeys } from '../settings/getGuildSetting.js';

export async function upsertCaseLog(guildId: Snowflake, user: User | undefined | null, case_: Case) {
	const client = container.resolve<Client<true>>(Client);
	const sql = container.resolve<Sql<any>>(kSQL);

	const guild = await client.guilds.fetch(guildId);
	const logChannel = await checkLogChannel(guild, await getGuildSetting(guild.id, SettingsKeys.ModLogChannelId));

	const embed = await generateCaseEmbed(guildId, logChannel!.id, user, case_);

	if (case_.logMessageId) {
		const message = await logChannel!.messages.fetch(case_.logMessageId);
		await message.edit({
			embeds: [embed],
		});
	} else {
		const logMessage = await logChannel!.send({
			embeds: [embed],
		});

		await sql`update cases
			set log_message_id = ${logMessage.id}
			where guild_id = ${case_.guildId}
				and case_id = ${case_.caseId}`;
	}
}

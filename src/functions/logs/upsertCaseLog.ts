import type { APIEmbed } from 'discord-api-types/v8';
import type { Guild, TextChannel, User } from 'discord.js';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';

import { kSQL } from '../../tokens';
import type { Case } from '../cases/createCase';
import { generateCaseLog } from './generateCaseLog';

export async function upsertCaseLog(guild: Guild, user: User, logChannel: TextChannel, case_: Case) {
	const sql = container.resolve<Sql<any>>(kSQL);

	const embed: APIEmbed = {
		author: {
			name: `${user.tag} (${user.id})`,
			icon_url: user.displayAvatarURL(),
		},
		description: await generateCaseLog(guild.client, case_, logChannel.id),
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

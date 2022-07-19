import type { CommandInteraction } from 'discord.js';
import i18next from 'i18next';
import type { Redis } from 'ioredis';
import { removeFlaggedUsername } from '../../../../util/flaggedUsernames.js';

export async function remove(
	interaction: CommandInteraction<'cached'>,
	data: string,
	redis: Redis,
	locale: string,
): Promise<void> {
	const removed = await removeFlaggedUsername(redis, data);

	if (removed) {
		await interaction.editReply(i18next.t('command.utility.usernames.removed.success', { locale, name: data }));
	} else {
		await interaction.editReply(i18next.t('command.utility.usernames.removed.failed', { locale, name: data }));
	}
}

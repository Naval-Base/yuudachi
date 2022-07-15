import type { CommandInteraction } from 'discord.js';
import i18next from 'i18next';
import type { Redis } from 'ioredis';
import { addBannedUsername, type RawBannedUsernameData } from '../../../../util/bannedUsernames.js';

export async function add(
	interaction: CommandInteraction<'cached'>,
	data: RawBannedUsernameData,
	redis: Redis,
	locale: string,
): Promise<void> {
	/**
	 * @param input `/(hype)\s+(events?|messages?|apply|team|system)/i`
	 * @returns `(hype)\s+(events?|messages?|apply|team|system)`
	 */
	const parseRegex = (input: string) => {
		const regex = /^\/(.+)\/(?:g|m|i|s|u|y)?$/;
		if (regex.test(input)) {
			return input.replace(regex, '$1');
		}
		return input;
	};

	data = {
		name: data.name,
		regex: parseRegex(data.regex),
	};

	try {
		new RegExp(data.regex);

		const alreadyExists = await redis.hexists('banned_usernames', data.name);
		const added = await addBannedUsername(redis, data);

		if (added) {
			const key = alreadyExists ? 'update' : 'success';
			await interaction.editReply(i18next.t(`command.utility.usernames.added.${key}`, { locale, name: data.name }));
		} else {
			await interaction.editReply(i18next.t('command.utility.usernames.added.failed', { locale, name: data.name }));
		}
	} catch (error) {
		await interaction.editReply(i18next.t('command.utility.usernames.added.invalid', { locale }));
	}
}

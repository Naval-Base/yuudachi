import type { CommandInteraction } from 'discord.js';
import i18next from 'i18next';
import type { Redis } from 'ioredis';
import RE2 from 're2';
import { addFlaggedUsername, type RawFlaggedUsernameData } from '../../../../util/flaggedUsernames.js';

export async function add(
	interaction: CommandInteraction<'cached'>,
	data: RawFlaggedUsernameData,
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

	const parsedData = {
		name: data.name,
		regex: parseRegex(data.regex),
	};

	try {
		new RE2(parsedData.regex);

		const alreadyExists = await redis.hexists('flagged_usernames', parsedData.name);
		const added = await addFlaggedUsername(redis, parsedData);

		if (added) {
			const key = alreadyExists ? 'update' : 'success';
			await interaction.editReply(
				i18next.t(`command.utility.usernames.added.${key}`, { locale, name: parsedData.name }),
			);
		} else {
			await interaction.editReply(
				i18next.t('command.utility.usernames.added.failed', { locale, name: parsedData.name }),
			);
		}
	} catch (error) {
		await interaction.editReply(i18next.t('command.utility.usernames.added.invalid', { locale }));
	}
}

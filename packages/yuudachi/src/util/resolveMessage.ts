import { type Snowflake, Client } from "discord.js";
import i18next from "i18next";
import { container } from "tsyringe";
import { getGuildSetting, SettingsKeys } from "../functions/settings/getGuildSetting.js";

export function parseMessageLink(link: string) {
	const linkRegex =
		/(?:https?:\/\/(?:ptb\.|canary\.)?discord\.com\/channels\/(?<guildId>\d{17,20})\/(?<channelId>\d{17,20})\/(?<messageId>\d{17,20}))/gi;
	const groups = linkRegex.exec(link)?.groups;

	if (!groups) {
		return null;
	}

	const { guildId, channelId, messageId } = groups;
	return { guildId, channelId, messageId };
}

export function validateSnowflake(id: Snowflake) {
	return /^\d{17,20}$/.test(id);
}

export async function resolveMessage(
	originChannelId: Snowflake,
	guildId: Snowflake,
	channelId: Snowflake,
	messageId: Snowflake,
	locale: string,
) {
	const client = container.resolve<Client<true>>(Client);

	const guild = client.guilds.resolve(guildId);

	if (!guild) {
		throw new Error(
			i18next.t("command.common.errors.no_guild", {
				guild_id: guildId,
				lng: locale,
			}),
		);
	}

	const channel = guild.channels.resolve(channelId);

	if (!channel?.isTextBased()) {
		throw new Error(
			i18next.t("command.common.errors.no_channel", {
				channel_id: channelId,
				guild: guild.name,
				lng: locale,
			}),
		);
	}

	const ignoreChannels = await getGuildSetting(guild.id, SettingsKeys.LogIgnoreChannels);

	if (
		originChannelId !== channel.id &&
		(ignoreChannels.includes(channel.id) ||
			(channel.parentId && ignoreChannels.includes(channel.parentId)) ||
			(channel.parent?.parentId && ignoreChannels.includes(channel.parent.parentId)))
	) {
		throw new Error(
			i18next.t("command.common.errors.ignored_channel", {
				lng: locale,
			}),
		);
	}

	try {
		return await channel.messages.fetch(messageId);
	} catch {
		throw new Error(
			i18next.t("command.common.errors.no_message", {
				message_id: messageId,
				// eslint-disable-next-line @typescript-eslint/no-base-to-string
				channel: channel.toString(),
				lng: locale,
			}),
		);
	}
}

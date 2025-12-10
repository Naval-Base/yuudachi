import { kSQL } from "@yuudachi/framework";
import { Client, type Guild, type Snowflake, type TextBasedChannel } from "discord.js";
import i18next from "i18next";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { parseMessageLink, resolveMessage } from "../src/util/resolveMessage.js";
import { createSqlMock, mockContainerGet } from "./mocks.js";

const getGuildSetting = vi.fn();
vi.mock("../src/util/functions/settings/getGuildSetting.js", () => ({
	getGuildSetting,
	SettingsKeys: { LogIgnoreChannels: "ignore" },
}));

const guildId = "1";
const channelId = "2";
const messageId = "3";

const locale = "en-US";

let client: Partial<Client<true>> & { guilds: { resolve: ReturnType<typeof vi.fn> } };
let sqlMock: ReturnType<typeof createSqlMock>;

beforeEach(() => {
	vi.clearAllMocks();

	client = {
		guilds: {
			resolve: vi.fn(),
		},
	} as Partial<Client<true>> & { guilds: { resolve: ReturnType<typeof vi.fn> } };

	sqlMock = createSqlMock(async () => [], []);

	mockContainerGet.mockReturnValue(client as unknown as Client<true>);
	mockContainerGet.mockImplementation((token) => {
		if (token === kSQL) return sqlMock;
		if (token === Client) return client as unknown as Client<true>;
		return undefined;
	});
});

describe("resolveMessage", () => {
	it("throws when guild cannot be resolved", async () => {
		client.guilds.resolve.mockReturnValue(null);

		await expect(resolveMessage("0", guildId, channelId, messageId, locale)).rejects.toThrow(
			i18next.t("command.common.errors.no_guild", { guild_id: guildId, lng: locale }),
		);
	});

	it("throws when channel is not text based", async () => {
		const guild = {
			channels: {
				resolve: vi.fn().mockReturnValue({ isTextBased: () => false }),
			},
			name: "guild",
		} as unknown as Guild;

		client.guilds.resolve.mockReturnValue(guild);

		await expect(resolveMessage("0", guildId, channelId, messageId, locale)).rejects.toThrow(
			i18next.t("command.common.errors.no_channel", { channel_id: channelId, guild: "guild", lng: locale }),
		);
	});

	it("throws when channel is ignored", async () => {
		getGuildSetting.mockResolvedValue([channelId]);
		sqlMock.unsafe.mockResolvedValueOnce([{ value: [channelId] }]);
		const channel = {
			id: channelId,
			isTextBased: () => true,
		};
		const guild = {
			channels: {
				resolve: vi.fn().mockReturnValue(channel),
			},
			name: "guild",
		} as unknown as Guild;
		client.guilds.resolve.mockReturnValue(guild);

		await expect(resolveMessage("0", guildId, channelId, messageId, locale)).rejects.toThrow(
			i18next.t("command.common.errors.ignored_channel", { lng: locale }),
		);
	});

	it("fetches message successfully", async () => {
		getGuildSetting.mockResolvedValue([]);
		const message = { id: messageId };
		const channel = {
			id: channelId,
			isTextBased: () => true,
			messages: {
				fetch: vi.fn().mockResolvedValue(message),
			},
		} as unknown as TextBasedChannel;
		const guild = {
			channels: {
				resolve: vi.fn().mockReturnValue(channel),
			},
			name: "guild",
		} as unknown as Guild;
		client.guilds.resolve.mockReturnValue(guild);

		await expect(resolveMessage(channelId, guildId, channelId, messageId, locale)).resolves.toBe(message);
	});

	it("throws when fetching message fails", async () => {
		getGuildSetting.mockResolvedValue([]);
		const channel = {
			id: channelId,
			isTextBased: () => true,
			toString: () => "#general",
			messages: {
				fetch: vi.fn().mockRejectedValue(new Error("no message")),
			},
		} as unknown as TextBasedChannel;
		const guild = {
			channels: {
				resolve: vi.fn().mockReturnValue(channel),
			},
			name: "guild",
		} as unknown as Guild;
		client.guilds.resolve.mockReturnValue(guild);

		await expect(resolveMessage("0", guildId, channelId, messageId, locale)).rejects.toThrow(
			i18next.t("command.common.errors.no_message", { message_id: messageId, channel: "#general", lng: locale }),
		);
	});
});

describe("parseMessageLink", () => {
	it("returns message identifiers for valid links", () => {
		const guild = "123456789012345678";
		const channel = "234567890123456789";
		const message = "345678901234567890";

		expect(parseMessageLink(`https://discord.com/channels/${guild}/${channel}/${message}`)).toEqual({
			channelId: channel as Snowflake,
			guildId: guild as Snowflake,
			messageId: message as Snowflake,
		});
	});

	it("returns null for invalid links", () => {
		expect(parseMessageLink("https://discord.com/channels/invalid")).toBeNull();
	});
});

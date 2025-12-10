import type { Snowflake } from "discord.js";
import { describe, expect, it } from "vitest";
import { findAutocompleteType, AutocompleteType } from "../src/functions/autocomplete/validate.js";
import { transformLockdown, type RawLockdown } from "../src/functions/lockdowns/transformLockdown.js";
import { getGuildSetting, SettingsKeys } from "../src/functions/settings/getGuildSetting.js";
import { createSqlMock, mockContainerGet } from "./mocks.js";

describe("findAutocompleteType", () => {
	it("detects case, report and reason focused fields", () => {
		expect(findAutocompleteType("case_reference")).toBe(AutocompleteType.Case);
		expect(findAutocompleteType("report_reference")).toBe(AutocompleteType.Report);
		expect(findAutocompleteType("reason")).toBe(AutocompleteType.Reason);
	});

	it("returns null for unknown fields", () => {
		expect(findAutocompleteType("other")).toBeNull();
	});
});

describe("transformLockdown", () => {
	it("maps raw lockdown payload to typed object", () => {
		const raw: RawLockdown = {
			channel_id: "1" as Snowflake,
			expiration: "2024-01-01T00:00:00Z",
			guild_id: "2" as Snowflake,
			mod_id: "3" as Snowflake,
			mod_tag: "Mod#0001",
			overwrites: [],
			reason: "Lockdown reason",
		};

		expect(transformLockdown(raw)).toEqual({
			channelId: "1",
			expiration: "2024-01-01T00:00:00Z",
			guildId: "2",
			modId: "3",
			modTag: "Mod#0001",
			overwrites: [],
			reason: "Lockdown reason",
		});
	});
});

describe("getGuildSetting", () => {
	it("returns stored setting value", async () => {
		const sqlMock = createSqlMock();
		sqlMock.unsafe.mockResolvedValue([{ value: "en-US" }]);
		mockContainerGet.mockReturnValueOnce(sqlMock);

		await expect(getGuildSetting("1" as Snowflake, SettingsKeys.Locale)).resolves.toBe("en-US");
		expect(sqlMock.unsafe).toHaveBeenCalledWith(expect.stringContaining(SettingsKeys.Locale), ["1"]);
	});

	it("returns null when not found", async () => {
		const sqlMock = createSqlMock();
		sqlMock.unsafe.mockResolvedValue([]);
		mockContainerGet.mockReturnValueOnce(sqlMock);

		await expect(getGuildSetting("5" as Snowflake, SettingsKeys.ModLogChannelId)).resolves.toBeNull();
	});

	it("allows overriding table name", async () => {
		const sqlMock = createSqlMock();
		sqlMock.unsafe.mockResolvedValue([{ value: "custom" }]);
		mockContainerGet.mockReturnValueOnce(sqlMock);

		await expect(getGuildSetting("9" as Snowflake, SettingsKeys.Locale, "other")).resolves.toBe("custom");
		expect(sqlMock.unsafe).toHaveBeenCalledWith(expect.stringContaining("from other"), ["9"]);
	});
});

import { Collection, inlineCode, type AutocompleteInteraction, type GuildMember } from "discord.js";
import i18next from "i18next";
import { describe, expect, it, vi } from "vitest";
import { canBan } from "../src/functions/anti-raid/canBan.js";
import { formatMemberTimestamps } from "../src/functions/anti-raid/formatMemberTimestamps.js";
import { parseAvatar } from "../src/functions/anti-raid/parseAvatar.js";
import { parseFile } from "../src/functions/anti-raid/parseFile.js";
import { resolveDateLocale } from "../src/functions/anti-raid/resolveDateLocale.js";
import { handleCaseAutocomplete } from "../src/functions/autocomplete/cases.js";
import { handleReasonAutocomplete } from "../src/functions/autocomplete/reasons.js";
import { handleReportAutocomplete } from "../src/functions/autocomplete/reports.js";
import { mockContainerGet } from "./mocks.js";

const request = vi.hoisted(() => vi.fn());

vi.mock("undici", () => ({
	request,
}));

vi.mock("../src/functions/cases/findCases.js", () => ({
	findCases: vi.fn(async () => [
		{
			case_id: 1,
			action: 1,
			target_tag: "User#0001",
			target_id: "111",
			reason: "Reason",
		},
	]),
}));

vi.mock("../src/functions/reports/findReports.js", () => ({
	findReports: vi.fn(async () => [
		{
			report_id: 2,
			type: 0,
			status: 0,
			author_tag: "Author#0002",
			author_id: "222",
			target_tag: "User#0001",
			target_id: "111",
			reason: "Reason",
		},
	]),
}));

const locale = "en-US";

const createAutocomplete = (focused: string): AutocompleteInteraction<"cached"> =>
	({
		options: {
			getFocused: () => focused,
		},
		respond: vi.fn(async () => undefined),
		client: {
			users: {
				fetch: vi.fn(async (id: string) => ({ id, tag: `User#${id}` })),
			},
		},
		guildId: "guild",
	}) as unknown as AutocompleteInteraction<"cached">;

describe("resolveDateLocale", () => {
	it("renders discord timestamp and fallback", () => {
		const ts = 1_700_000_000_000;
		expect(resolveDateLocale(ts, true)).toContain("<t:");
		expect(resolveDateLocale(null)).toBe(inlineCode("Not specified"));
	});
});

describe("parseFile", () => {
	it("extracts ids from attachment content", async () => {
		request.mockResolvedValue({
			body: { text: async () => "prefix 12345678901234567 suffix" },
		});

		const ids = await parseFile({ url: "https://file" } as any);
		expect(ids.has("12345678901234567")).toBe(true);
	});

	it("returns empty set when no ids", async () => {
		request.mockResolvedValue({
			body: { text: async () => "nothing here" },
		});

		const ids = await parseFile({ url: "https://file" } as any);
		expect(ids.size).toBe(0);
	});
});

describe("parseAvatar", () => {
	it("returns null for empty input and handles none keyword", async () => {
		await expect(parseAvatar()).resolves.toBeNull();
		await expect(parseAvatar("none")).resolves.toBe("none");
	});

	it("returns hash from url and user fetch", async () => {
		mockContainerGet.mockReturnValueOnce({
			users: { fetch: vi.fn(async () => ({ avatar: "fetchedhash" })) },
		});
		await expect(parseAvatar("123456789012345678")).resolves.toBe("fetchedhash");

		await expect(
			parseAvatar("https://cdn.discordapp.com/avatars/1/abcdefabcdefabcdefabcdefabcdefab.png"),
		).resolves.toBe("abcdefabcdefabcdefabcdefabcdefab.png");
	});
});

describe("formatMemberTimestamps", () => {
	it("computes creation and join ranges", () => {
		const member = {
			joinedTimestamp: 1_000,
			user: { createdTimestamp: 500 },
		} as unknown as GuildMember;
		const other = {
			joinedTimestamp: 2_000,
			user: { createdTimestamp: 1_500 },
		} as unknown as GuildMember;
		const collection = new Collection<string, GuildMember>([
			["a", member],
			["b", other],
		]);

		const result = formatMemberTimestamps(collection);
		expect(result.creationRange).toContain("second");
		expect(result.joinRange).toContain("second");
	});
});

describe("canBan", () => {
	it("rejects bots, self, protected and privileged users", () => {
		const base = { roles: { cache: { hasAny: vi.fn(() => false) } }, permissions: { any: vi.fn(() => false) } };
		expect(canBan({ ...base, id: "1", user: { bot: false }, bannable: true } as any, "1", [], locale)).toBe(
			i18next.t("command.mod.anti_raid_nuke.common.errors.result.reject_self", { lng: locale }),
		);
		expect(canBan({ ...base, id: "2", user: { bot: true }, bannable: true } as any, "1", [], locale)).toBe(
			i18next.t("command.mod.anti_raid_nuke.common.errors.result.reject_bot", { lng: locale }),
		);
		expect(canBan({ ...base, id: "3", user: { bot: false }, bannable: false } as any, "1", [], locale)).toBe(
			i18next.t("command.mod.anti_raid_nuke.common.errors.result.reject_unbanable", { lng: locale }),
		);
		expect(
			canBan(
				{ ...base, id: "4", user: { bot: false }, bannable: true, roles: { cache: { hasAny: () => true } } } as any,
				"1",
				["x"],
				locale,
			),
		).toBe(i18next.t("command.mod.anti_raid_nuke.common.errors.result.reject_protected", { lng: locale }));
		expect(
			canBan(
				{
					...base,
					id: "5",
					user: { bot: false },
					bannable: true,
					permissions: { any: () => true },
				} as any,
				"1",
				[],
				locale,
			),
		).toBe(i18next.t("command.mod.anti_raid_nuke.common.errors.result.reject_perms", { lng: locale }));
		expect(canBan({ ...base, id: "6", user: { bot: false }, bannable: true } as any, "1", [], locale)).toBeNull();
	});
});

describe("autocomplete handlers", () => {
	it("handles reason autocomplete results", async () => {
		const interaction = {
			options: { getFocused: () => "trol" },
			respond: vi.fn(),
		} as unknown as AutocompleteInteraction;

		await handleReasonAutocomplete(interaction, locale);
		expect(interaction.respond).toHaveBeenCalled();
		const [payload] = (interaction.respond as ReturnType<typeof vi.fn>).mock.calls[0] ?? [];
		expect(Array.isArray(payload)).toBe(true);
		expect(payload.some((entry: { name: string }) => entry.name.includes("Troll"))).toBe(true);
	});

	it("responds with case choices and history option", async () => {
		const interaction = createAutocomplete(" query ");

		await expect(handleCaseAutocomplete(interaction, "en", true)).resolves.not.toThrow();
	});

	it("responds with report choices and history option", async () => {
		const interaction = createAutocomplete(" query ");

		await expect(handleReportAutocomplete(interaction, "en", true)).resolves.not.toThrow();
	});
});

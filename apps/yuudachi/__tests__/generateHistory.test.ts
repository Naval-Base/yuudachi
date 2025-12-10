import type { ButtonInteraction, User } from "discord.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CaseAction } from "../src/functions/cases/createCase.js";
import { ReportStatus } from "../src/functions/reports/createReport.js";
import {
	generateCaseHistory,
	generateHistory,
	generateReportHistory,
	HistoryType,
} from "../src/util/generateHistory.js";
import { createSqlMock, kSQL, mockContainerGet, mockLogger } from "./mocks.js";

const getGuildSetting = vi.fn();
vi.mock("../functions/settings/getGuildSetting.js", () => ({
	getGuildSetting,
	SettingsKeys: { ModLogChannelId: "modLog" },
}));

vi.mock("./actionKeys.js", () => ({
	caseActionLabel: vi.fn((action, locale) => `action-${action}-${locale}`),
	reportStatusLabel: vi.fn((status, locale) => `status-${status}-${locale}`),
}));

const interaction = { guildId: "guild" } as const;
const user = {
	id: "user",
	tag: "user#0001",
	displayAvatarURL: () => "avatar.png",
	createdTimestamp: Date.parse("2020-01-01T00:00:00.000Z"),
	toString: () => "<@user>",
} as unknown as User;

const sqlMock = createSqlMock<any>(async (strings?: TemplateStringsArray) => {
	const query = strings?.[0] ?? "";

	if (query.includes("from cases")) {
		return [
			{
				created_at: "2024-01-01T00:00:00.000Z",
				action: CaseAction.Warn,
				case_id: 1,
				log_message_id: "log",
				guild_id: interaction.guildId,
				reason: "first reason",
				target_id: user.id,
			},
			{
				created_at: "2024-02-01T00:00:00.000Z",
				action: CaseAction.Ban,
				case_id: 2,
				log_message_id: null,
				guild_id: interaction.guildId,
				reason: "second reason",
				target_id: user.id,
			},
		];
	}

	if (query.includes("from reports")) {
		return [
			{
				created_at: "2024-03-01T00:00:00.000Z",
				report_id: 10,
				log_post_id: "channel",
				guild_id: interaction.guildId,
				status: ReportStatus.Approved,
				author_id: user.id,
				target_id: user.id,
				reason: "report reason",
			},
		];
	}

	return [];
}, "123");

beforeEach(() => {
	getGuildSetting.mockResolvedValue("123");
	mockContainerGet.mockReturnValue(sqlMock);
	mockContainerGet.mockImplementation((token) => {
		if (token === kSQL) return sqlMock;
		return undefined;
	});
});

describe("generateCaseHistory", () => {
	it("builds embed from cases", async () => {
		const embed = await generateCaseHistory(interaction as unknown as ButtonInteraction<"cached">, { user }, "en");

		expect(embed.title).toBe("log.history.cases.title:en");
		expect(embed.color).toBeDefined();
		expect(embed.description).not.toContain("log.history.common.errors.no_history:en");
		expect(embed.footer?.text).toContain("log.history.cases.summary.restriction");
	});

	it("returns no-history message when user has no cases", async () => {
		sqlMock.mockImplementationOnce(async () => []);

		const embed = await generateCaseHistory(interaction as unknown as ButtonInteraction<"cached">, { user }, "en");

		expect(embed.description).toContain("log.history.common.errors.no_history:en");
		expect(embed.color).toBeDefined();
	});
});

describe("generateReportHistory", () => {
	it("builds embed from reports", async () => {
		const embed = await generateReportHistory(interaction as unknown as ButtonInteraction<"cached">, { user }, "en");

		expect(embed.title).toBe("log.history.reports.title:en");
		expect(embed.description).not.toContain("log.history.common.errors.no_history:en");
		expect(embed.footer?.text).toContain("log.history.reports.summary.target");
	});

	it("returns no-history message when user has no reports", async () => {
		sqlMock.mockImplementationOnce(async () => []);

		const embed = await generateReportHistory(interaction as unknown as ButtonInteraction<"cached">, { user }, "en");

		expect(embed.description).toContain("log.history.common.errors.no_history:en");
	});
});

describe("generateHistory", () => {
	it("generates case history by default", async () => {
		const embed = await generateHistory(interaction as unknown as ButtonInteraction<"cached">, { user }, "en");

		expect(embed.author?.name).toContain(user.tag);
		expect(embed.footer?.text).toContain("log.history.cases.summary");
		expect(embed.color).toBeDefined();
	});

	it("generates report history", async () => {
		const embed = await generateHistory(
			interaction as unknown as ButtonInteraction<"cached">,
			{ user },
			"en",
			HistoryType.Report,
		);

		expect(embed.title).toBe("log.history.reports.title:en");
		expect(embed.footer?.text).toContain("log.history.reports.summary");
	});

	it("logs unhandled history type", async () => {
		await generateHistory(interaction as unknown as ButtonInteraction<"cached">, { user }, "en", 999 as HistoryType);

		expect(mockLogger.warn).toHaveBeenCalled();
	});
});

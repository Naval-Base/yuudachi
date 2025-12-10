import type * as FrameworkModule from "@yuudachi/framework";
import type { APIEmbed } from "discord.js";
import { describe, expect, it, vi } from "vitest";
import { transformAppeal } from "../src/functions/appeals/transformAppeal.js";
import { transformCase } from "../src/functions/cases/transformCase.js";
import { generateCaseEmbed } from "../src/functions/logging/generateCaseEmbed.js";
import { generateCasePayload } from "../src/functions/logging/generateCasePayload.js";
import { generateReportEmbed } from "../src/functions/logging/generateReportEmbed.js";
import { transformReport } from "../src/functions/reports/transformReport.js";

vi.mock("@yuudachi/framework", async (importOriginal) => {
	const actual = await importOriginal<typeof FrameworkModule>();
	return {
		...actual,
		addFields: vi.fn((embed: APIEmbed) => embed),
	};
});

vi.mock("../src/functions/logging/generateCaseColor.js", () => ({
	generateCaseColor: vi.fn(() => 123),
}));

vi.mock("../src/functions/logging/generateCaseLog.js", () => ({
	generateCaseLog: vi.fn(async () => "case log"),
}));

vi.mock("../src/functions/settings/getGuildSetting.js", () => ({
	getGuildSetting: vi.fn(async () => "en"),
	SettingsKeys: { Locale: "locale" },
}));

vi.mock("../src/functions/logging/generateReportLog.js", () => ({
	generateReportLog: vi.fn(async () => "report log"),
}));

describe("transformers", () => {
	it("transforms case, appeal and report rows", () => {
		const rawCase = {
			case_id: 1,
			guild_id: "1",
			action: 2,
			role_id: "10",
			action_expiration: "2024-01-01",
			reason: "reason",
			mod_id: "2",
			mod_tag: "Mod#0001",
			target_id: "3",
			target_tag: "User#0003",
			context_message_id: "5",
			ref_id: 6,
			report_ref_id: 7,
			appeal_ref_id: 8,
			log_message_id: "9",
			action_processed: true,
			multi: false,
			created_at: "2024-01-01",
		};
		expect(transformCase(rawCase as any)).toMatchObject({
			caseId: 1,
			guildId: "1",
			roleId: "10",
			actionProcessed: true,
			createdAt: "2024-01-01",
		});

		const rawAppeal = {
			appeal_id: 1,
			guild_id: "1",
			status: 0,
			target_id: "3",
			target_tag: "User#0003",
			mod_id: "2",
			mod_tag: "Mod#0001",
			reason: "reason",
			ref_id: 4,
			updated_at: null,
			created_at: "2024-01-01",
		};
		expect(transformAppeal(rawAppeal as any)).toMatchObject({
			appealId: 1,
			refId: 4,
			createdAt: "2024-01-01",
		});

		const rawReport = {
			attachment_url: null,
			author_id: "2",
			author_tag: "Author",
			channel_id: "3",
			context_messages_ids: ["10"],
			created_at: "2024-01-01",
			guild_id: "1",
			log_post_id: null,
			message_id: "4",
			mod_id: "5",
			mod_tag: "Mod",
			reason: "Reason",
			ref_id: 6,
			report_id: 7,
			status: 1,
			target_id: "8",
			target_tag: "User",
			type: 2,
			updated_at: null,
		};
		expect(transformReport(rawReport as any)).toMatchObject({
			reportId: 7,
			contextMessagesIds: ["10"],
			targetId: "8",
		});
	});
});

describe("generateCasePayload", () => {
	it("builds payload with references and expiration", () => {
		const payload = generateCasePayload({
			guildId: "1",
			action: 2,
			roleId: "10",
			duration: 1_000,
			args: {
				reason: "reason",
				case_reference: 5,
				report_reference: 6,
				appeal_reference: 7,
				days: 2,
				user: {
					member: null,
					user: { id: "3", tag: "User#0003" } as any,
				},
			},
			user: { id: "4", tag: "Mod#0004" } as any,
			messageId: "11",
		});

		expect(payload).toMatchObject({
			guildId: "1",
			roleId: "10",
			reason: "reason",
			modId: "4",
			targetId: "3",
			refId: 5,
			reportRefId: 6,
			appealRefId: 7,
			contextMessageId: "11",
		});
		expect(payload.actionExpiration).toBeInstanceOf(Date);
	});
});

describe("generateCaseEmbed", () => {
	it("builds embed with author and localized footer", async () => {
		const caseData = {
			caseId: 1,
			guildId: "1",
			action: 1,
			createdAt: "2024-01-01",
		} as any;

		const embed = await generateCaseEmbed(
			"1" as any,
			"2" as any,
			{ id: "4", tag: "Mod#4", displayAvatarURL: () => "url" } as any,
			caseData,
		);
		expect(embed).toMatchObject({
			author: { name: "Mod#4 (4)", icon_url: "url" },
			color: 123,
		});
	});
});

describe("generateReportEmbed", () => {
	it("maps status to color and attaches image", async () => {
		const report = {
			status: 2,
			attachmentUrl: "https://image",
			targetId: "1",
			targetTag: "Target",
			authorId: "2",
			authorTag: "Author",
			guildId: "3",
		} as any;
		const user = {
			id: "10",
			tag: "Author",
			avatarURL: () => "avatar",
			client: { user: { displayAvatarURL: () => "client-avatar" } },
		} as any;

		const embed = await generateReportEmbed(user, report, "en");
		expect(embed.color).toBeDefined();
		expect(embed.image?.url).toBe("https://image");
		expect(embed.description).toBe("report log");
	});
});

import { type GuildMember } from "discord.js";
import i18next from "i18next";
import { describe, expect, it } from "vitest";
import { generateMemberLog } from "../src/util/generateMemberLog.js";
import { mockTruncateEmbed } from "./mocks.js";

const baseMember = {
	user: {
		id: "1",
		tag: "user#0001",
		createdTimestamp: Date.parse("2020-01-01T00:00:00.000Z"),
		toString: () => "<@1>",
		displayAvatarURL: () => "avatar.png",
	},
	displayAvatarURL: () => "avatar.png",
} as unknown as GuildMember;

const locale = "en-US";

describe("generateMemberLog", () => {
	it("creates join embed with creation and join info", () => {
		const member = {
			...baseMember,
			joinedTimestamp: Date.parse("2020-02-01T00:00:00.000Z"),
		} as unknown as GuildMember;

		const embed = generateMemberLog(member, locale);

		expect(embed.description).toContain("• Username: <@1> - `user#0001` (1)");
		expect(embed.description).toContain("`1577836800000`"); // creation timestamp
		expect(embed.description).toContain("`1580515200000`"); // join timestamp
		expect(embed.footer?.text).toBe(i18next.t("log.member_log.footer.joined", { lng: locale }));
		expect(embed.timestamp).toBeDefined();
		expect(mockTruncateEmbed).toHaveBeenCalledWith(embed);
	});

	it("creates leave embed when join flag is false", () => {
		const embed = generateMemberLog(baseMember as GuildMember, locale, false);

		expect(embed.color).toBe(3_092_790);
		expect(embed.description).toContain("• Username: <@1> - `user#0001` (1)");
		expect(embed.description).toContain("• Left:");
		expect(embed.footer?.text).toBe(i18next.t("log.member_log.footer.left", { lng: locale }));
	});

	it("does not include join details when joined timestamp is missing", () => {
		const embed = generateMemberLog({ ...baseMember, joinedTimestamp: undefined } as unknown as GuildMember, locale);

		expect(embed.description).not.toContain("Joined:");
	});
});

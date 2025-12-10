import { type GuildMember } from "discord.js";
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

describe("generateMemberLog", () => {
	it("creates join embed with creation and join info", () => {
		const member = {
			...baseMember,
			joinedTimestamp: Date.parse("2020-02-01T00:00:00.000Z"),
		} as unknown as GuildMember;

		const embed = generateMemberLog(member, "en");

		expect(embed.description).toContain("log.member_log.description:en");
		expect(embed.description).toContain("log.member_log.joined_at:en");
		expect(embed.footer?.text).toBe("log.member_log.footer.joined:en");
		expect(embed.timestamp).toBeDefined();
		expect(mockTruncateEmbed).toHaveBeenCalledWith(embed);
	});

	it("creates leave embed when join flag is false", () => {
		const embed = generateMemberLog(baseMember as GuildMember, "en", false);

		expect(embed.color).toBe(3_092_790);
		expect(embed.description).toContain("log.member_log.left_at:en");
		expect(embed.footer?.text).toBe("log.member_log.footer.left:en");
	});

	it("does not include join details when joined timestamp is missing", () => {
		const embed = generateMemberLog({ ...baseMember, joinedTimestamp: undefined } as unknown as GuildMember, "en");

		expect(embed.description).not.toContain("log.member_log.joined_at:en");
	});
});

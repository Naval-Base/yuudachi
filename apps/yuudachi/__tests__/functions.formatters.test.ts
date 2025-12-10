import { afterEach, describe, expect, it } from "vitest";
import { generateFormatterUrl } from "../src/functions/formatters/generateFormatterUrl.js";
import {
	blockquote,
	checkbox,
	emptyLine,
	heading,
	horizontalRule,
	list,
	table,
	TableAlignment,
} from "../src/functions/formatters/markdownUtils.js";

const envBackup = {
	REPORT_FORMATTER_URL: process.env.REPORT_FORMATTER_URL,
};

afterEach(() => {
	process.env.REPORT_FORMATTER_URL = envBackup.REPORT_FORMATTER_URL;
});

describe("markdown utils", () => {
	it("creates headings, checkboxes and lists", () => {
		expect(heading("Title", 3)).toBe("### Title");
		expect(checkbox("unchecked")).toBe("- [ ] unchecked");
		expect(checkbox("checked", true)).toBe("- [x] checked");
		expect(list(["first", "second"])).toBe("- first\n- second");
		expect(list(["first", "second"], true)).toBe("1. first\n1. second");
		expect(list([], true)).toBe("");
	});

	it("renders tables with alignment", () => {
		const output = table(
			["Name", "Count"],
			[
				["Alice", "1"],
				["Bob", "2"],
			],
			TableAlignment.Center,
		);

		const lines = output.split("\n");
		expect(lines).toEqual(["| Name | Count |", "|:----:|:-----:|", "| Alice | 1 |", "| Bob | 2 |"]);
	});

	it("formats blockquotes and helpers", () => {
		expect(blockquote("note")).toBe("> note");
		expect(blockquote("nested", true)).toBe(">> nested");
		expect(horizontalRule()).toBe("---");
		expect(emptyLine()).toBe("");
		expect(emptyLine(true)).toBe("\n");
	});
});

describe("generateFormatterUrl", () => {
	it("embeds the file url into the formatter endpoint", () => {
		process.env.REPORT_FORMATTER_URL = "https://formatter.test/render";
		const input = "https://storage.test/files/with spaces.txt";

		const url = generateFormatterUrl(input);

		expect(url).toBe("https://formatter.test/render?url=https://storage.test/files/with%20spaces.txt");
	});
});

import kleur from "kleur";
import { describe, expect, it, vi } from "vitest";
import { removeCodeBlocks } from "../src/util/codeBlock.js";
import { colorBasedOnBoolean, colorBasedOnDeterminant, colorBasedOnDifference } from "../src/util/colors.js";
import { findBestMatch } from "../src/util/findBestMatch.js";
import { parseRegex } from "../src/util/parseRegex.js";
import { resolveTimestamp } from "../src/util/timestamp.js";

describe("parseRegex", () => {
	it("returns null for empty input", () => {
		expect(parseRegex(null)).toBeNull();
		expect(parseRegex(undefined)).toBeNull();
		expect(parseRegex("")).toBeNull();
	});

	it("parses slash wrapped expressions", () => {
		const regex = parseRegex("/(foo)/i");

		expect(regex).toBeDefined();
		expect(regex!.source).toBe("(foo)");
	});

	it("parses plain expressions and applies fullMatch anchor", () => {
		const regex = parseRegex("foo", true, true);

		expect(regex).toBeDefined();
		expect(regex!.source).toBe("^foo$");
	});

	it("returns null for invalid expressions", () => {
		expect(parseRegex("*")).toBeNull();
	});
});

describe("resolveTimestamp", () => {
	it("parses ISO dates directly", () => {
		expect(resolveTimestamp("2024-01-01T00:00:00.000Z")).toBe(Date.parse("2024-01-01T00:00:00.000Z"));
	});

	it("parses snowflakes", () => {
		const snowflake = "175928847299117063";
		expect(resolveTimestamp(snowflake)).toBeGreaterThan(0);
	});

	it("parses numeric strings", () => {
		expect(resolveTimestamp("12345")).toBe(12_345);
	});

	it("parses duration strings", () => {
		vi.setSystemTime(new Date("2024-01-01T00:00:00.000Z"));
		expect(resolveTimestamp("1h")).toBe(Date.now() - 3_600_000);
	});

	it("returns null for invalid input", () => {
		expect(resolveTimestamp("invalid-duration")).toBeNull();
	});
});

describe("findBestMatch", () => {
	it("returns options when input too short", () => {
		expect(findBestMatch("hi", ["hello", "hey"])).toEqual(["hello", "hey"]);
	});

	it("prioritizes closest matches", () => {
		const result = findBestMatch("hello", ["hell", "hero", "help"]);
		expect(result).toContain("hell");
		expect(result).toContain("help");
	});

	it("returns empty array when no suggestions qualify", () => {
		expect(findBestMatch("zzz", ["abc", "def"])).toEqual([]);
	});
});

describe("color helpers", () => {
	it("returns unmodified string when no predicate matches", () => {
		const output = colorBasedOnDeterminant<number>(5, (value) => `${value}`, [
			{ color: kleur.red, predicate: () => false },
		]);

		expect(output).toBe("5");
	});

	it("uses first matching predicate", () => {
		const output = colorBasedOnDeterminant<number>(1, () => "value", [
			{ color: kleur.green, predicate: () => false },
			{ color: kleur.yellow, predicate: () => true },
			{ color: kleur.red, predicate: () => true },
		]);

		expect(output).toBe(kleur.yellow("value"));
	});

	it("colors based on difference thresholds", () => {
		expect(colorBasedOnDifference(1_000 * 60 * 60 * 24 * 7, "diff")).toBe(kleur.red("diff"));
		expect(colorBasedOnDifference(1_000 * 60 * 60 * 24 * 7 * 3, "diff")).toBe(kleur.yellow("diff"));
		expect(colorBasedOnDifference(1_000 * 60 * 60 * 24 * 7 * 10, "diff")).toBe(kleur.cyan("diff"));
		expect(colorBasedOnDifference(1_000 * 60 * 60 * 24 * 7 * 60, "diff")).toBe(kleur.green("diff"));
	});

	it("colors based on boolean", () => {
		expect(colorBasedOnBoolean(true, "bool")).toBe("bool");
		expect(colorBasedOnBoolean(false, "bool")).toBe(kleur.red("bool"));
	});
});

describe("removeCodeBlocks", () => {
	it("strips inline and multi-line code fences", () => {
		const input = "normal `code` text ```block``` end";
		expect(removeCodeBlocks(input)).toBe("normal  text  end");
	});
});

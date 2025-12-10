import { describe, expect, it, vi } from "vitest";
import { resolveRedirect } from "../src/util/resolveRedirect.js";

const request = vi.hoisted(() => vi.fn());

vi.mock("undici", () => ({
	request,
}));

describe("resolveRedirect", () => {
	it("returns redirect location when present", async () => {
		request.mockResolvedValue({ headers: { location: "https://example.com" } });

		await expect(resolveRedirect("https://start.test")).resolves.toBe("https://example.com");
	});

	it("falls back to initial url", async () => {
		request.mockResolvedValue({ headers: {} });

		await expect(resolveRedirect("https://start.test")).resolves.toBe("https://start.test");
	});
});

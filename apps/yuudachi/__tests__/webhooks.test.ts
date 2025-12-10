import { kWebhooks } from "@yuudachi/framework";
import { describe, expect, it } from "vitest";
import { createWebhooks } from "../src/util/webhooks.js";
import { mockContainerBind } from "./mocks.js";

describe("createWebhooks", () => {
	it("binds and returns webhook map", () => {
		const result = createWebhooks();

		expect(result).toBeInstanceOf(Map);
		expect(mockContainerBind).toHaveBeenCalledWith({ provide: kWebhooks, useValue: result });
	});
});

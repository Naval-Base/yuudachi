import type * as FrameworkModule from "@yuudachi/framework";
import i18next from "i18next";
import { afterEach, vi } from "vitest";
import enUS from "../locales/en-US/translation.json" assert { type: "json" };
import {
	kRedis,
	kSQL,
	kWebhooks,
	mockAddFields,
	mockContainerBind,
	mockContainerGet,
	mockCreateButton,
	mockEllipsis,
	mockLogger,
	mockTruncate,
	mockTruncateEmbed,
} from "./mocks.js";

await i18next.init({
	lng: "en-US",
	fallbackLng: "en-US",
	returnNull: false,
	returnEmptyString: false,
	resources: {
		"en-US": { translation: enUS as Record<string, unknown> },
	},
});

vi.mock("@yuudachi/framework", async (importOriginal) => {
	const mod = await importOriginal<typeof FrameworkModule>();
	return {
		...mod,
		createButton: (...args: Parameters<typeof mod.createButton>) => {
			mockCreateButton(args[0] as unknown);
			return mod.createButton(...args);
		},
		addFields: (...args: Parameters<typeof mod.addFields>) => {
			const [first, ...rest] = args;
			mockAddFields(first as unknown, ...(rest as unknown[]));
			return mod.addFields(...args);
		},
		truncate: mockTruncate,
		truncateEmbed: mockTruncateEmbed,
		container: { get: mockContainerGet, bind: mockContainerBind },
		kSQL,
		kWebhooks,
		kRedis,
		EMBED_DESCRIPTION_LIMIT: mod.EMBED_DESCRIPTION_LIMIT,
		logger: mockLogger,
		ellipsis: mockEllipsis,
	};
});

afterEach(() => {
	mockCreateButton.mockClear();
	mockAddFields.mockClear();
	mockTruncate.mockClear();
	mockTruncateEmbed.mockClear();
	mockContainerGet.mockClear();
	mockContainerBind.mockClear();
	mockLogger.warn.mockClear();
	mockLogger.info.mockClear();
	mockLogger.error.mockClear();
});

import { afterEach, vi } from "vitest";
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
	translateMock,
} from "./mocks.js";

vi.mock("i18next", () => ({
	default: {
		// eslint-disable-next-line id-length
		t: translateMock,
	},
}));

vi.mock("@yuudachi/framework", () => ({
	createButton: mockCreateButton,
	addFields: mockAddFields,
	truncate: mockTruncate,
	truncateEmbed: mockTruncateEmbed,
	container: { get: mockContainerGet, bind: mockContainerBind },
	kSQL,
	kWebhooks,
	kRedis,
	EMBED_DESCRIPTION_LIMIT: 120,
	logger: mockLogger,
	ellipsis: mockEllipsis,
}));

afterEach(() => {
	mockCreateButton.mockClear();
	mockAddFields.mockClear();
	mockTruncate.mockClear();
	mockTruncateEmbed.mockClear();
	mockContainerGet.mockClear();
	mockContainerBind.mockClear();
	mockLogger.warn.mockClear();
	translateMock.mockClear();
});

import { type Message } from "discord.js";
import { describe, expect, it } from "vitest";
import { createMessageLinkButton } from "../src/util/createMessageLinkButton.js";
import { mockCreateButton } from "./mocks.js";

describe("createMessageLinkButton", () => {
	it("creates link button with message url", () => {
		const message = {
			url: "https://discord.com/channels/1/2/3",
		} as Pick<Message<true>, "url">;

		createMessageLinkButton(message as Message<true>, "en");

		expect(mockCreateButton).toHaveBeenCalledWith({
			style: expect.any(Number),
			url: message.url,
			label: "command.common.buttons.message_reference:en",
		});
	});
});

import { type Message } from "discord.js";
import i18next from "i18next";
import { describe, expect, it } from "vitest";
import { createMessageLinkButton } from "../src/util/createMessageLinkButton.js";
import { mockCreateButton } from "./mocks.js";

const locale = "en-US";

describe("createMessageLinkButton", () => {
	it("creates link button with message url", () => {
		const message = {
			url: "https://discord.com/channels/1/2/3",
		} as Pick<Message<true>, "url">;

		createMessageLinkButton(message as Message<true>, locale);

		expect(mockCreateButton).toHaveBeenCalledTimes(1);
		expect(mockCreateButton).toHaveBeenCalledWith({
			style: expect.any(Number),
			url: message.url,
			label: i18next.t("command.common.buttons.message_reference", { lng: locale }),
		});
	});
});

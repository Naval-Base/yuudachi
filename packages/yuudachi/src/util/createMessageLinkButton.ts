import { createButton } from "@yuudachi/framework";
import { type Message, ButtonStyle } from "discord.js";
import i18next from "i18next";

export function createMessageLinkButton(message: Message<true>, locale: string) {
	return createButton({
		style: ButtonStyle.Link,
		url: message.url,
		label: i18next.t("command.common.buttons.message_reference", { lng: locale }),
	});
}

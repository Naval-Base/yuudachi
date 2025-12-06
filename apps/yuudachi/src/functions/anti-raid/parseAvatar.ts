import { container } from "@yuudachi/framework";
import { Client } from "discord.js";

export async function parseAvatar(input?: string | null | undefined) {
	if (!input) {
		return null;
	}

	if (input.toLowerCase() === "none") {
		return "none";
	}

	if (/^[\d,a-f]{32}$/.test(input)) {
		return input;
	}

	const idReg = /\d{17,}/;

	if (idReg.test(input)) {
		try {
			const client = container.resolve<Client<true>>(Client);
			const user = await client.users.fetch(input);

			return user.avatar ?? "none";
		} catch {
			return null;
		}
	}

	try {
		new URL(input);
		// eslint-disable-next-line prefer-named-capture-group
		return input.replace(/https:\/\/cdn.discordapp.com.*\/([\d,a-f]{32})/, "$1");
	} catch {
		return null;
	}
}

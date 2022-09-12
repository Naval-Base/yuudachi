import type { Attachment } from "discord.js";
import { request as fetch } from "undici";

export async function parseFile(file: Attachment) {
	const content = await (await fetch(file.url)).body.text();
	const ids = content.match(/\d{17,20}/g);

	if (!ids?.length) {
		return new Set<string>();
	}

	return new Set<string>(ids);
}

import type { Attachment } from 'discord.js';
import fetch from 'node-fetch';

export async function parseFile(file: Attachment) {
	const content = await (await fetch(file.url)).text();
	const ids = content.match(/\d{17,20}/g);

	if (!ids?.length) {
		return new Set<string>();
	}

	return new Set<string>(ids);
}

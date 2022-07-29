import type { Attachment } from 'discord.js';
import fetch from 'node-fetch';

export async function parseFile(file: Attachment): Promise<Set<string>> {
	const content = await (await fetch(file.url)).text();
	const ids: string[] | null = content.match(/\d{17,20}/g);

	if (!ids?.length) {
		return new Set();
	}

	return new Set(ids);
}

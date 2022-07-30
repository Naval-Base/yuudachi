import { URL } from 'node:url';
import type { Client } from 'discord.js';

export async function parseAvatar(client: Client, input?: string): Promise<string | 'none' | undefined> {
	if (!input) {
		return undefined;
	}

	if (input.toLowerCase() === 'none') {
		return 'none';
	}

	if (/^[a-f,0-9]{32}$/.test(input)) {
		return input;
	}

	const idReg = /\d{17,}/;

	if (idReg.test(input)) {
		try {
			const user = await client.users.fetch(input);
			return user.avatar ?? 'none';
		} catch {
			return undefined;
		}
	}

	try {
		new URL(input);
		return input.replace(/https:\/\/cdn.discordapp.com.*\/([a-f,0-9]{32})/, '$1');
	} catch {
		return undefined;
	}
}

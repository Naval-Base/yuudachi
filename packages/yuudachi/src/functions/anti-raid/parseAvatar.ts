import type { Client } from 'discord.js';
import { noop } from '../../util/noop.js';

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
		const user = await client.users.fetch(input).catch(noop);
		if (user) {
			return user.avatar ?? 'none';
		}
		return undefined;
	}

	try {
		new URL(input);
		return input.replace(/https:\/\/cdn.discordapp.com.*\/([a-f,0-9]{32})/, '$1');
	} catch (e) {
		return undefined;
	}
}

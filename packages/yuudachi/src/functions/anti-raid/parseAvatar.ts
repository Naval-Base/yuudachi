import { URL } from 'node:url';
import { Client } from 'discord.js';
import { container } from 'tsyringe';

export async function parseAvatar(input?: string) {
	if (!input) {
		return null;
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
			const client = container.resolve<Client<true>>(Client);
			const user = await client.users.fetch(input);

			return user.avatar ?? 'none';
		} catch {
			return null;
		}
	}

	try {
		new URL(input);
		return input.replace(/https:\/\/cdn.discordapp.com.*\/([a-f,0-9]{32})/, '$1');
	} catch {
		return null;
	}
}

import type { Client } from 'discord.js';

function noop(...args: any[]): void {
	void args;
}

export async function parseAvatar(client: Client, input?: string): Promise<string | 'none' | undefined> {
	if (!input) {
		return undefined;
	}

	if (input.toLowerCase() === 'none') {
		return 'none';
	}

	const idReg = /\d{17,}/;

	if (idReg.test(input)) {
		const user = await client.users.fetch(input).catch(noop);
		if (user) {
			return user.avatar ?? undefined;
		}
		return undefined;
	}

	try {
		new URL(input);
		return input.replace(/https:\/\/cdn.discordapp.com.*\/([a-f0-9]*)/, '$1');
	} catch (e) {
		return undefined;
	}
}

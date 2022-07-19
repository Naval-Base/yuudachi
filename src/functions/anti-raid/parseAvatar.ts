import type { Client } from 'discord.js';
import { type BufferObject, type UrlRequestObject, imageHash } from 'image-hash';
import { noop } from 'lodash';
import { ANTI_RAID_NUKE_AVATAR_BITS } from '../../Constants.js';


export async function promiseImageHash(params: string | UrlRequestObject | BufferObject): Promise<string> {
	return new Promise((resolve, reject) => {
		imageHash(params, ANTI_RAID_NUKE_AVATAR_BITS, true, (err: Error | null, hash: string) => {
			if (err) {
				reject(err);
			} else {
				resolve(hash);
			}
		});
	}) 
}

export async function parseAvatar(
	input: string,
	client: Client,
): Promise<string | 'noPfp' | null> {

	if (input.toLowerCase() === 'nopfp') {
		return 'noPfp';
	}

	const idReg = /\d{17,}/;

	let url: string | null = null;

	if (idReg.test(input)) {
		const user = await client.users.fetch(input).catch(noop);
		if (user) {
			url = user.avatarURL({ size: 512, extension: 'jpeg', forceStatic: true });
		} else {
			return null;	
		}
	}

	try {
		new URL(input);
		url = input;
	} catch (e) {
		return null;
	}

	return promiseImageHash(url);
}
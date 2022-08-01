import { request as fetch } from 'undici';

export async function resolveRedirect(initial: string) {
	const res = await fetch(initial);
	const loc = res.headers.location;

	return loc ?? initial;
}

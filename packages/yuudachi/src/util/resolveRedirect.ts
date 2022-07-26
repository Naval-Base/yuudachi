import fetch from 'node-fetch';

export async function resolveRedirect(initial: string): Promise<string> {
	const res = await fetch(initial, { redirect: 'manual' });
	const loc = res.headers.get('location');
	return loc ?? initial;
}

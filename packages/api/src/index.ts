import fetch from 'cross-fetch';

import HttpException from './HttpException';
import Guilds from './api/Guilds';

export { HttpException };

export default class API {
	public constructor(private readonly baseURL: string) {}

	public guilds = new Guilds(this);

	public async make(userId: string, method: string, endpoint: string, body?: unknown) {
		const headers: Record<string, string> =
			method.toLowerCase() === 'put' || method.toLowerCase() === 'post' ? { 'content-type': 'application/json' } : {};
		headers['x-user-id'] = userId;

		const res = await fetch(`${this.baseURL}/api${endpoint}`, {
			method,
			body: body ? JSON.stringify(body) : undefined,
			headers,
		});

		if (res.ok) return res.json();
		throw new HttpException(await res.json());
	}
}

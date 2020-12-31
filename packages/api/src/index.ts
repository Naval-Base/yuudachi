import fetch from 'cross-fetch';

import HttpException from './HttpException';
import Guilds from './api/Guilds';
import Users from './api/Users';

export { HttpException };

export default class API {
	public constructor(private readonly baseURL: string) {}

	public guilds = new Guilds(this);
	public users = new Users(this);

	public async make<T = unknown>(
		method: string,
		endpoint: string,
		body?: unknown,
		headers_: Record<string, string> = {},
	): Promise<T> {
		const headers: Record<string, string> =
			method.toLowerCase() === 'patch' || method.toLowerCase() === 'put' || method.toLowerCase() === 'post'
				? { 'content-type': 'application/json', ...headers_ }
				: { ...headers_ };

		const res = await fetch(`${this.baseURL}/api${endpoint}`, {
			method,
			body: body ? JSON.stringify(body) : undefined,
			headers,
		});

		if (res.ok) return res.json();
		throw new HttpException(await res.json());
	}
}

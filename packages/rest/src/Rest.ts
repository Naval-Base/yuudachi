import { Amqp } from '@spectacles/brokers';
import FormData from '@discordjs/form-data';

import HttpException from './HttpException';

interface RequestOptions {
	reason?: string;
	files?: {
		name: string;
		file: Buffer | Uint8Array;
	}[];
}

interface Request {
	method: string;
	path: string;
	body?: any;
	headers?: Record<string, string>;
	options?: RequestOptions;
}

interface ResponseBody {
	status: number;
	headers: Record<string, string>;
	url: string;
	body: Buffer | Uint8Array;
}

interface Response {
	status: number;
	body: unknown;
}

export default class Rest {
	public constructor(public readonly token: string, public readonly broker: Amqp) {}

	public get<T = unknown>(path: string, options?: RequestOptions): Promise<T> {
		return this.do({ method: 'GET', path, options });
	}

	public post<T = unknown>(path: string, body: any, options?: RequestOptions): Promise<T> {
		return this.do({ method: 'POST', path, body, options });
	}

	public put<T = unknown>(path: string, body: any, options?: RequestOptions): Promise<T> {
		return this.do({ method: 'PUT', path, body, options });
	}

	public patch<T = unknown>(path: string, body: any, options?: RequestOptions): Promise<T> {
		return this.do({ method: 'PATCH', path, body, options });
	}

	public delete<T = unknown>(path: string, options?: RequestOptions): Promise<T> {
		return this.do({ method: 'DELETE', path, options });
	}

	protected async do<T>(req: Request): Promise<T> {
		const options = req.options;
		delete req.options;

		let body;
		let headers = {};
		if (options) {
			if (options.reason) {
				headers = { ...headers, 'X-Audit-Log-Reason': options.reason };
			}
			if (options.files) {
				const form = new FormData();
				for (const file of options.files) form.append(file.name, file.file, file.name);
				if (req.body) form.append('payload_json', JSON.stringify(req.body));
				body = form.getBuffer();
				headers = { ...headers, ...form.getHeaders() };
			}
		}

		if (!body) {
			body = req.body ? Buffer.from(JSON.stringify(req.body)) : undefined;
			if (req.method !== 'DELETE') {
				headers = { ...headers, 'Content-Type': 'application/json' };
			}
		}

		const res: Response = await this.broker.call('REQUEST', {
			...req,
			body,
			headers: {
				Authorization: `Bot ${this.token}`,
				'X-RateLimit-Precision': 'millisecond',
				...headers,
			},
		});

		if (res.status === 0) {
			const httpRes = res.body as ResponseBody;
			if (httpRes.status >= 200 && httpRes.status < 300) {
				try {
					return JSON.parse(httpRes.body.toString()) as T;
				} catch {
					/* istanbul ignore next */
					return (body as unknown) as T;
				}
			} else {
				/* istanbul ignore next */
				throw new HttpException(httpRes.status, httpRes.body.toString());
			}
		}
		throw new Error(res.body as string);
	}
}

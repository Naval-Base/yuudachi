import { Amqp } from '@spectacles/brokers';
import HttpException from './HttpException';

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

interface RequestOptions {
	reason?: string;
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

		const body = req.body ? Buffer.from(JSON.stringify(req.body)) : undefined;
		const headers = options?.reason ? { 'X-Audit-Log-Reason': options.reason } : {};

		const res: Response = await this.broker.call('REQUEST', {
			...req,
			body,
			headers: {
				...headers,
				Authorization: `Bot ${this.token}`,
				'X-RateLimit-Precision': 'millisecond',
				'Content-Type': 'application/json',
			},
		});

		// TODO: handle non-2xx status codes
		if (res.status === 0) {
			const httpRes = res.body as ResponseBody;
			if (httpRes.status >= 200 && httpRes.status < 300) {
				try {
					return JSON.parse(httpRes.body.toString()) as T;
				} catch {
					return (body as unknown) as T;
				}
			} else {
				throw new HttpException(httpRes.status, httpRes.body.toString());
			}
		}
		throw new Error(res.body as string);
	}
}

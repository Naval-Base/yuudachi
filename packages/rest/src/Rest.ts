import { Amqp } from '@spectacles/brokers';

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
	body: unknown;
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

		const headers = options?.reason ? { 'X-Audit-Log-Reason': options.reason } : {};

		const res: Response = await this.broker.call('REQUEST', {
			...req,
			headers: {
				...headers,
				Authorization: `Bot ${this.token}`,
				'X-RateLimit-Precision': 'millisecond',
				'Content-Type': 'application/json',
			},
		});

		// TODO: handle non-2xx status codes
		if (res.status === 0) return (res.body as ResponseBody).body as T;
		throw new Error(res.body as string);
	}
}

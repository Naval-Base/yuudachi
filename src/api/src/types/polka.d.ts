/* eslint-disable */

declare module 'polka' {
	import { Server } from 'net';
	import { IncomingMessage, ServerResponse } from 'http';
	import Trouter from 'trouter';

	export interface ParsedURL {
		_raw: string;
		href: string;
		path: string;
		search: null | string;
		query: null | Record<string, any>;
	}
	export interface Request extends IncomingMessage, ParsedURL {
		originalUrl: IncomingMessage['url'];
		params: Record<string, string>;
		body?: Record<string, any>;
		_parsedUrl: ParsedURL;
		_decoded?: true;
	}

	export type Response = ServerResponse;
	export interface IError extends Error {
		message: string;
		code?: number;
		stack?: string;
		status?: number;
		details?: any;
	}

	export type NextHandler = (err?: string | IError) => void;
	export type RequestHandler<T> = (req: T, res: Response, next?: NextHandler) => void;

	export type Middleware<T = Request> = Polka<T> | RequestHandler<T>;
	export type ErrorHandler<T = Request> = (err: string | IError, req: T, res: Response, next: NextHandler) => void;

	export interface Polka<T = Request> extends Trouter<RequestHandler<T>> {
		readonly server: typeof Server;
		readonly wares: RequestHandler<T>[];

		readonly onError: ErrorHandler<T>;
		readonly onNoMatch: RequestHandler<T>;

		parse: (req: IncomingMessage) => ParsedURL | void;

		use(...handlers: Middleware<T>[]): this;
		use(pattern: string, ...handlers: Middleware<T>[]): this;

		readonly handler: RequestHandler<T>;

		listen: Server['listen'];
	}

	export interface IOptions<T = Request> {
		server?: Server;
		onError?: ErrorHandler<T>;
		onNoMatch?: RequestHandler<T>;
	}

	export = <T = IncomingMessage>(options?: IOptions<T>): Polka<T> => {};
}

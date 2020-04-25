import { basename, dirname } from 'path';
import { Request, RequestHandler, Response, NextHandler } from 'polka';

declare module 'polka' {
	export interface Request {
		userId?: string;
	}
}

export enum RouteMethod {
	GET = 'get',
	POST = 'post',
	PUT = 'put',
	DELETE = 'delete',
	PATCH = 'patch',
}

export interface RouteInfo {
	path: string;
	method: RouteMethod;
}

export function pathToRouteInfo(path: string): RouteInfo | null {
	const method = basename(path, '.js');
	if (!([RouteMethod.GET, RouteMethod.POST, RouteMethod.PUT, RouteMethod.DELETE, RouteMethod.PATCH] as string[]).includes(method)) return null;

	if (!path.startsWith('/')) path = '/' + path;
	return {
		path: dirname(path
			.replace(/\[(.+)\]/g, ':$1')
			.replace(/\\/g, '/')),
		method: method as any,
	};
}

export default interface Route {
	middleware: RequestHandler<Request>[];
	handle(req: Request, res: Response, next: NextHandler): void | Promise<void>;
}

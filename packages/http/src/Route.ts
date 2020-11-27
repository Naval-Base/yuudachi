import { basename, dirname } from 'path';
import { Request, RequestHandler, Response, NextHandler, Polka } from 'polka';
import { AuthInfo } from '@yuudachi/types';

declare module 'polka' {
	export interface Request {
		cookies?: Record<string, string>;
		auth?: AuthInfo;
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
	if (
		!([RouteMethod.GET, RouteMethod.POST, RouteMethod.PUT, RouteMethod.DELETE, RouteMethod.PATCH] as string[]).includes(
			method,
		)
	) {
		return null;
	}

	path = path.replace(/\[(.+)\]/g, ':$1').replace(/\\/g, '/');
	if (!path.startsWith('/')) path = `/${path}`;
	return {
		path: dirname(path),
		method: method as RouteMethod,
	};
}

export default abstract class Route {
	public readonly middleware: RequestHandler<Request>[] = [];
	public abstract handle(req: Request, res: Response, next: NextHandler): void | Promise<void>;

	public register(info: RouteInfo, server: Polka) {
		server[info.method](`/api${info.path}`, ...this.middleware, async (req, res, next) => {
			try {
				await this.handle(req, res, next!);
			} catch (e) {
				next?.(e);
			}
		});
	}
}

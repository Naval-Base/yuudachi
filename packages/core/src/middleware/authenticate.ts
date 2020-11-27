import { unauthorized } from '@hapi/boom';
import cookie from 'cookie';
import { Request, Response, NextHandler } from 'polka';
import { container } from 'tsyringe';
import { AuthInfo } from '@yuudachi/types';

import { AuthManager } from '../managers';

declare module 'polka' {
	export interface Request {
		cookies?: Record<string, string>;
		auth?: AuthInfo;
		userId?: string;
	}
}

export default (ignoreExpiration = false) => async (req: Request, _: Response, next?: NextHandler) => {
	const authManager = container.resolve(AuthManager);

	let token: string | undefined;
	if (req.headers.authorization?.startsWith('Bearer ')) {
		token = req.headers.authorization.substr('Bearer '.length);
	} else if (req.headers.cookie) {
		token = cookie.parse(req.headers.cookie).access_token;
	}
	if (!token) return next?.(unauthorized('Malformed or missing JWT'));

	try {
		const userId = await authManager.verify(token, ignoreExpiration);

		req.auth = { userId, token };
		return next?.();
	} catch {
		return next?.(unauthorized());
	}
};

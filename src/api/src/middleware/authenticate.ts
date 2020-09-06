import { unauthorized } from '@hapi/boom';
import cookie from 'cookie';
import { Request, Response, NextHandler } from 'polka';
import { container } from 'tsyringe';
import AuthManager from '../managers/AuthManager';

export interface AuthInfo {
	userId: string;
	token: string;
}

export interface OAuthInfo {
	token: string;
	userId: string;
}

export default async (req: Request, _: Response, next?: NextHandler) => {
	const authManager = container.resolve(AuthManager);

	let token: string;

	if (req.headers.authorization?.startsWith('Bearer ')) {
		token = req.headers.authorization.substr('Bearer '.length);
	} else if (req.headers.cookie) {
		token = cookie.parse(req.headers.cookie).token;
	} else {
		return next?.(unauthorized('Malformed or missing JWT'));
	}

	try {
		const userId = await authManager.verify(token);

		req.auth = { userId, token };
		return next?.();
	} catch {
		return next?.(unauthorized());
	}
};

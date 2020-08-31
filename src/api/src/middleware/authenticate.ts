import { badRequest, unauthorized } from '@hapi/boom';
import { Request, Response, NextHandler } from 'polka';
import { container } from 'tsyringe';

import AuthManager from '../managers/AuthManager';

export interface AuthInfo {
	userId: string;
	token: string;
}

interface TokenData {
	sub: string;
}

export interface OAuthInfo {
	token: string;
	userId: string;
}

export default async (req: Request, _: Response, next?: NextHandler) => {
	const authManager = container.resolve(AuthManager);
	const auth = req.headers.authorization;
	if (!auth || !auth.startsWith('Bearer ')) return next?.(badRequest('Malformed or missing JWT'));

	const token = auth.substr('Bearer '.length);

	try {
		const userId = await authManager.verify(token);

		req.auth = { userId, token };
		return next?.();
	} catch {
		return next?.(unauthorized());
	}
};

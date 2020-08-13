import cookie from 'cookie';
import { badRequest, unauthorized } from '@hapi/boom';
import { Request, Response, NextHandler } from 'polka';
import { injectable } from 'tsyringe';
import AuthManager, { AuthCredentials } from '../../../managers/AuthManager';
import Route from '../../../Route';
import { authenticate } from '../../../middleware';

@injectable()
export default class TokenRefreshRoute extends Route {
	public middleware = [authenticate];

	public constructor(public authManager: AuthManager) {
		super();
	}

	public async handle(req: Request, res: Response, next: NextHandler): Promise<void> {
		if (!req.headers.cookie) return next(badRequest('Missing refresh token'));

		const cookies = cookie.parse(req.headers.cookie) as { refresh_token?: string };
		if (!cookies.refresh_token) return next(badRequest('Missing refresh token'));

		let credentials: AuthCredentials;
		try {
			credentials = await this.authManager.refresh(req.auth!.token, cookies.refresh_token);
		} catch {
			return next(unauthorized());
		}

		AuthManager.respondWith(credentials, res);
		res.end();
	}
}

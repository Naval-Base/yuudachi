import jwt from 'jsonwebtoken';
import { injectable, inject } from 'tsyringe';
import { Sql } from 'postgres';
import { kConfig, kSQL } from '../tokens';
import { Response } from 'polka';
import { Config } from '../Config';

export interface AuthCredentials {
	accessToken: string;
	refreshToken: string;
}

interface AccessTokenData {
	sub: string;
	iat: number;
	'https://hasura.io/jwt/claims': {
		'x-hasura-allowed-roles': string[];
		'x-hasura-default-role': string;
		'x-hasura-user-id': string;
	};
	refresh: false;
}

interface RefreshTokenData {
	sub: string;
	iat: number;
	refresh: true;
}

@injectable()
export default class AuthManager {
	public constructor(
		@inject(kConfig)
		public readonly config: Config,
		@inject(kSQL)
		public readonly sql: Sql<any>,
	) {}

	public static respondWith(credentials: AuthCredentials, res: Response) {
		res.cookie('access_token', credentials.accessToken, { path: '/', sameSite: 'strict' });
		res.cookie('refresh_token', credentials.refreshToken, { httpOnly: true, path: '/', sameSite: 'strict' });
	}

	public refresh(accessToken: string, refreshToken: string): Promise<AuthCredentials> {
		const accessData = jwt.verify(accessToken, this.config.secretKey, { ignoreExpiration: true }) as AccessTokenData;
		const refreshData = jwt.verify(refreshToken, this.config.secretKey) as RefreshTokenData;

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (accessData.refresh || !refreshData.refresh) throw new Error('invalid tokens');
		if (accessData.sub !== refreshData.sub) throw new Error('incompatible tokens');

		return this.create(accessData.sub);
	}

	public async verify(token: string): Promise<string> {
		const data = jwt.verify(token, this.config.secretKey) as AccessTokenData;

		const [user] = (await this.sql`select token_reset_at from users where id = ${data.sub}`) as [
			{ token_reset_at: string },
		];
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (!user) throw new Error('invalid user');
		if (new Date(user.token_reset_at).getTime() / 1000 > data.iat) throw new Error('invalid token');

		return data.sub;
	}

	public async create(userId: string): Promise<AuthCredentials> {
		const [{ token_reset_at }] = (await this.sql`
			update users set token_reset_at = now()
			where id = ${userId}
			returning token_reset_at
		`) as [{ token_reset_at: string }];

		const iat = Math.ceil(new Date(token_reset_at).getTime() / 1000);

		const tokenData: AccessTokenData = {
			sub: userId,
			iat,
			'https://hasura.io/jwt/claims': {
				'x-hasura-allowed-roles': ['user', 'mod', 'admin'],
				'x-hasura-default-role': 'user',
				'x-hasura-user-id': userId,
			},
			refresh: false,
		};

		const accessToken = jwt.sign(tokenData, this.config.secretKey, { expiresIn: '15m' });
		const refreshToken = jwt.sign({ sub: userId, iat, refresh: true }, this.config.secretKey, { expiresIn: '7d' });

		return { accessToken, refreshToken };
	}
}

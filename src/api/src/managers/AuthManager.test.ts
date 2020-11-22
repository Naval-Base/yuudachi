import 'reflect-metadata';

import { Sql } from 'postgres';
import { advanceTo, clear } from 'jest-date-mock';
import { container } from 'tsyringe';

import AuthManager from './AuthManager';
import Config from '../Config';
import { kConfig, kSQL } from '../tokens';

const mockedPostgres: jest.MockedFunction<Sql<any>> = jest.fn() as any;

container.register<Config>(kConfig, {
	useValue: {
		discordClientId: '',
		discordClientSecret: '',
		discordScopes: [],
		publicApiDomain: '',
		publicFrontendDomain: '',
		secretKey: 'SuperSecret',
	},
});

container.register(kSQL, { useValue: mockedPostgres });

afterEach(() => {
	mockedPostgres.mockRestore();
	clear();
});

test('sends response', () => {
	const cookieSetter = jest.fn();
	const accessExpiration = new Date();
	const refreshExpiration = new Date();

	AuthManager.respondWith(
		{
			access: {
				expiration: new Date(),
				token: 'abcdefg',
			},
			refresh: {
				expiration: new Date(),
				token: 'hijklmn',
			},
		},
		{ cookie: cookieSetter },
	);

	expect(cookieSetter).toHaveBeenCalledTimes(2);
	expect(cookieSetter).toHaveBeenNthCalledWith(1, 'access_token', 'abcdefg', {
		expires: accessExpiration,
		path: '/',
		sameSite: 'strict',
	});
	expect(cookieSetter).toHaveBeenLastCalledWith('refresh_token', 'hijklmn', {
		httpOnly: true,
		expires: refreshExpiration,
		path: '/',
		sameSite: 'strict',
	});
});

test('refreshes token', async () => {
	advanceTo();

	mockedPostgres.mockReturnValue([{ role: 'user', token_reset_at: new Date().toISOString() }] as any);

	const accessToken =
		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwicmVmcmVzaCI6ZmFsc2V9.h38LyY0OlJlS4Q8ZH1OtPj9FP9JI5SbNNBlrFBKiZxw';
	const refreshToken =
		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwicmVmcmVzaCI6dHJ1ZX0.yHzgFbQtRkyq8kCQYHqWEAPhls63yFIk6bub95zm1j0';

	const authManager = container.resolve(AuthManager);

	await expect(authManager.refresh(accessToken, refreshToken)).resolves.toStrictEqual({
		access: {
			expiration: new Date(900000), // 0 + 15m
			token:
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjowLCJodHRwczovL2hhc3VyYS5pby9qd3QvY2xhaW1zIjp7IngtaGFzdXJhLWFsbG93ZWQtcm9sZXMiOlsidXNlciIsInVzZXIiXSwieC1oYXN1cmEtZGVmYXVsdC1yb2xlIjoidXNlciIsIngtaGFzdXJhLXVzZXItaWQiOiIxMjM0NTY3ODkwIn0sInJlZnJlc2giOmZhbHNlLCJleHAiOjkwMH0.KntOpGBacs_lKS12qN_iG3S5_eNT3NC64jvTgUT0Ey8',
		},
		refresh: {
			expiration: new Date(604800000), // 0 + 7d
			token:
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjowLCJyZWZyZXNoIjp0cnVlLCJleHAiOjYwNDgwMH0.Uuc2uYdCazvBNFjZV_woPzYUs-4dYJOIHew5U_S-FU8',
		},
	});
});

test('verifies token', async () => {
	mockedPostgres.mockReturnValue([{ role: 'user', token_reset_at: 0 }] as any);
	const authManager = container.resolve(AuthManager);

	const token =
		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwicmVmcmVzaCI6ZmFsc2V9.h38LyY0OlJlS4Q8ZH1OtPj9FP9JI5SbNNBlrFBKiZxw';

	await expect(authManager.verify(token)).resolves.toBe('1234567890');
});

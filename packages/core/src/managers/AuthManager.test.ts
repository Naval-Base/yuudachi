import 'reflect-metadata';

import type { Sql } from 'postgres';
import { advanceTo, clear } from 'jest-date-mock';
import { container } from 'tsyringe';
import { Config } from '@yuudachi/types';

import { AuthManager } from './AuthManager';
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

	mockedPostgres.mockReturnValue([{ token_reset_at: new Date().toISOString() }] as any);

	const accessToken =
		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwicmVmcmVzaCI6ZmFsc2V9.h38LyY0OlJlS4Q8ZH1OtPj9FP9JI5SbNNBlrFBKiZxw';
	const refreshToken =
		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwicmVmcmVzaCI6dHJ1ZX0.yHzgFbQtRkyq8kCQYHqWEAPhls63yFIk6bub95zm1j0';

	const authManager = container.resolve(AuthManager);

	await expect(authManager.refresh(accessToken, refreshToken)).resolves.toStrictEqual({
		access: {
			expiration: new Date(900000), // 0 + 15m
			token:
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjotMiwiaHR0cHM6Ly9oYXN1cmEuaW8vand0L2NsYWltcyI6eyJ4LWhhc3VyYS1hbGxvd2VkLXJvbGVzIjpbInVzZXIiXSwieC1oYXN1cmEtZGVmYXVsdC1yb2xlIjoidXNlciIsIngtaGFzdXJhLXVzZXItaWQiOiIxMjM0NTY3ODkwIn0sInJlZnJlc2giOmZhbHNlLCJleHAiOjg5OH0.fdn2HTdZh1G_l13zoeY3n8dhCjWpyYSBlorwszBIRNc',
		},
		refresh: {
			expiration: new Date(604800000), // 0 + 7d
			token:
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjotMiwicmVmcmVzaCI6dHJ1ZSwiZXhwIjo2MDQ3OTh9.jwIm_ti6BbmuZi3_wF08y7ob8eAcHTbDGud1mUi6QnU',
		},
	});
});

test('verifies token', async () => {
	mockedPostgres.mockReturnValue([{ token_reset_at: 0 }] as any);
	const authManager = container.resolve(AuthManager);

	const token =
		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwicmVmcmVzaCI6ZmFsc2V9.h38LyY0OlJlS4Q8ZH1OtPj9FP9JI5SbNNBlrFBKiZxw';

	await expect(authManager.verify(token)).resolves.toBe('1234567890');
});

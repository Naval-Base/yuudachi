import 'reflect-metadata';

import supertest from 'supertest';
import { container } from 'tsyringe';
import postgres, { Sql } from 'postgres';
import { createApp } from '@yuudachi/http';
import { Config } from '@yuudachi/types';

import authenticate from './authenticate';
import { AuthManager } from '../managers';

import { kSQL, kConfig } from '../tokens';

const NOW = new Date();
jest.spyOn(global, 'Date').mockImplementation((): any => NOW);
Date.now = jest.fn(() => NOW.getTime());

const originalJWT = jest.requireActual('jsonwebtoken');

jest.mock('postgres', () => jest.fn(() => jest.fn()));
jest.mock('@yuudachi/http', () => {
	const original = jest.requireActual('@yuudachi/http');
	return {
		...original,
		discordOAuth2: jest
			.fn()
			.mockImplementation(() =>
				Promise.resolve({ access_token: 'Test Token 2', refresh_token: 'test_refresh_token_2', expires_in: 300 }),
			),
	};
});

const mockedAuthManager = { verify: jest.fn() };
const mockedPostgres: jest.MockedFunction<Sql<any>> = postgres() as any;
const mockHandler = jest.fn((_, res) => res.end());

container.register(kSQL, { useValue: mockedPostgres });
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
container.register(AuthManager, { useValue: mockedAuthManager as any });

const token = originalJWT.sign({ sub: '12345' }, 'SuperSecret') as string;
const expiredToken = originalJWT.sign({ sub: '12345' }, 'SuperSecret', {
	expiresIn: '-10s',
}) as string;

beforeEach(() => {
	jest.resetModules();
	process.env.JWT_SECRET = 'SuperSecret';
});

afterEach(() => {
	jest.clearAllMocks();
});

const app = createApp();
app.use(authenticate(true));
app.get('/test', mockHandler);
app.listen(0);

afterAll(() => {
	app.server.close();
});

test('missing jwt cookie', async () => {
	await supertest(app.server).get('/test').expect(401);

	expect(mockHandler).not.toHaveBeenCalled();
});

test('missing jwt cookie property', async () => {
	await supertest(app.server).get('/test').set('Cookie', 'foo=bar').expect(401);
});

test('has valid user jwt cookie', async () => {
	await supertest(app.server).get('/test').set('Cookie', `access_token=${token}`).expect(200);

	expect(mockedAuthManager.verify).toHaveBeenCalledWith(token, true);
});

test('has valid authorization header', async () => {
	await supertest(app.server).get('/test').set('authorization', `Bearer ${token}`).expect(200);

	mockedAuthManager.verify.mockReturnValue('12345');
	expect(mockedAuthManager.verify).toHaveBeenCalledWith(token, true);
});

test('has expired user jwt cookie', async () => {
	mockedPostgres.mockImplementation((): any => Promise.resolve([{ refresh_token: 'test_refresh_token' }]));
	mockedAuthManager.verify.mockImplementation(() => {
		throw new Error();
	});

	await supertest(app.server).get('/test').set('Cookie', `access_token=${expiredToken}`).expect(401);
	expect(mockedAuthManager.verify).toHaveBeenCalledWith(expiredToken, true);
});

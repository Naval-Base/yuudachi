import 'reflect-metadata';

import supertest from 'supertest';
import { container } from 'tsyringe';
import postgres, { Sql } from 'postgres';
import jwt from 'jsonwebtoken';

import { kSQL, kConfig } from '../tokens';
import authenticate from './authenticate';
import createApp from '../app';
import Config from '../Config';

const NOW = new Date();
jest.spyOn(global, 'Date').mockImplementation((): any => NOW);
Date.now = jest.fn(() => NOW.getTime());

const originalJWT = jest.requireActual('jsonwebtoken');

jest.mock('postgres', () => jest.fn(() => jest.fn()));
jest.mock('jsonwebtoken');
jest.mock('../util/auth', () => {
	const original = jest.requireActual('../util/auth');
	return {
		...original,
		discordOAuth2: jest
			.fn()
			.mockImplementation(() =>
				Promise.resolve({ access_token: 'Test Token 2', refresh_token: 'test_refresh_token_2', expires_in: 300 }),
			),
	};
});

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
app.use(authenticate);
app.get('/test', mockHandler);
app.listen(0);

afterAll(() => {
	app.server.close();
});

test('missing jwt cookie', async () => {
	await supertest(app.server).get('/test').expect(401);

	expect(mockHandler).not.toHaveBeenCalled();
});

test('has valid user jwt cookie', async () => {
	await supertest(app.server).get('/test').set('Cookie', `token=${token}`);

	expect(jwt.verify).toHaveBeenCalledWith(token, 'SuperSecret');
});

test('has expired user jwt cookie', async () => {
	((jwt.verify as unknown) as jest.Mock).mockImplementation(() => {
		throw new originalJWT.TokenExpiredError('jwt expired', new Date());
	});
	mockedPostgres.mockImplementation((): any => Promise.resolve([{ refresh_token: 'test_refresh_token' }]));

	await supertest(app.server).get('/test').set('Cookie', `token=${expiredToken}`);

	expect(jwt.verify).toHaveBeenCalledWith(expiredToken, 'SuperSecret');
});

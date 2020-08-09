import 'reflect-metadata';

import supertest from 'supertest';
import { container } from 'tsyringe';
import postgres, { Sql } from 'postgres';
import jwt from 'jsonwebtoken';

import { kSQL } from '../tokens';
import authenticate from './authenticate';
import createApp from '../app';

const NOW = new Date();
jest.spyOn(global, 'Date').mockImplementation((): any => NOW);
Date.now = jest.fn(() => NOW.getTime());

const originalJWT = jest.requireActual('jsonwebtoken');

jest.mock('postgres', () => jest.fn(() => jest.fn()));
jest.mock('jsonwebtoken');
jest.mock('../util', () => {
	const original = jest.requireActual('../util');
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
	await supertest(app.server).get('/test').expect(400);

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
	((jwt.decode as unknown) as jest.Mock).mockReturnValue({ sub: '12345' });
	mockedPostgres.mockImplementation((): any => Promise.resolve([{ refresh_token: 'test_refresh_token' }]));

	await supertest(app.server).get('/test').set('Cookie', `token=${expiredToken}`);

	expect(jwt.verify).toHaveBeenCalledWith(expiredToken, 'SuperSecret');
	expect(jwt.decode).toHaveBeenCalledWith(expiredToken);

	expect(mockedPostgres).toHaveBeenCalledTimes(2);
	expect(mockedPostgres).toHaveBeenNthCalledWith(
		1,
		[
			`
					select refresh_token
					from connections
					where user_id = `,
			`
						and provider = "Discord";`,
		],
		'12345',
	);

	expect(mockedPostgres).toHaveBeenLastCalledWith(
		[
			`
					update connections
					set access_token = `,
			`,
						refresh_token = `,
			`,
						expires_at = `,
			`
					where user_id = `,
			`
						and provider = "Discord";`,
		],
		'Test Token 2',
		'test_refresh_token_2',
		NOW,
		'12345',
	);
});

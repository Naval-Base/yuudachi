import { badRequest, internal, unauthorized } from '@hapi/boom';
import { Http2ServerResponse } from 'http2';
import fetch from 'node-fetch';
const { Response } = jest.requireActual('node-fetch');

import { discordOAuth2, sendBoom } from './util';

jest.mock('http2');
jest.mock('node-fetch');
jest.mock('form-data');

const MockedResponse = (Http2ServerResponse as unknown) as jest.Mock<Http2ServerResponse>;

beforeEach(() => {
	process.env.DISCORD_CLIENT_ID = 'SuperSecret';
	process.env.DISCORD_CLIENT_SECRET = 'SuperSecret';
	process.env.DISCORD_CALLBACK_DOMAIN = 'http://localhost';
	process.env.DISCORD_CALLBACK_ROUTE = '/test/callback';
	process.env.DISCORD_SCOPES = 'test,test2';
});

afterEach(() => {
	jest.clearAllMocks();
});

describe('send boom', () => {
	test('with bad request', () => {
		const err = badRequest();
		const res = new MockedResponse();
		sendBoom(err, res);

		expect(res.statusCode).toBe(400);
		expect(res.setHeader).toHaveBeenCalledTimes(0);
		expect(res.end).toHaveBeenCalledWith(`{"statusCode":400,"error":"Bad Request","message":"Bad Request"}`);
	});

	test('with internal server error', () => {
		const err = internal();
		const res = new MockedResponse();
		sendBoom(err, res);

		expect(res.statusCode).toBe(500);
		expect(res.setHeader).toHaveBeenCalledTimes(0);
		expect(res.end).toHaveBeenCalledWith(
			`{"statusCode":500,"error":"Internal Server Error","message":"An internal server error occurred"}`,
		);
	});

	test('with headers', () => {
		const err = unauthorized('foo', ['abc', 'def']);
		const res = new MockedResponse();
		sendBoom(err, res);

		expect(res.statusCode).toBe(401);
		expect(res.setHeader).toHaveBeenCalledTimes(1);
		expect(res.setHeader).toHaveBeenCalledWith('WWW-Authenticate', 'abc, def');
		expect(res.end).toHaveBeenCalledWith(`{"statusCode":401,"error":"Unauthorized","message":"foo"}`);
	});
});

describe('oauth2', () => {
	const mockResponse = {
		access_token: 'test_token',
		token_type: 'test_type',
		expires_in: 123,
		refresh_token: 'test_refresh_token',
		scope: ['test', 'scope'],
	};

	test('proper form with code', async () => {
		((fetch as unknown) as jest.Mock).mockImplementation(() =>
			Promise.resolve(new Response(JSON.stringify(mockResponse))),
		);

		const res = await discordOAuth2({ code: 'test' });

		expect(fetch).toHaveBeenCalledTimes(1);
		expect(res).toStrictEqual(mockResponse);
	});

	test('proper form with refresh token', async () => {
		((fetch as unknown) as jest.Mock).mockImplementation(() =>
			Promise.resolve(new Response(JSON.stringify(mockResponse))),
		);

		const res = await discordOAuth2({ refreshToken: 'refresh_test' });

		expect(fetch).toHaveBeenCalledTimes(1);
		expect(res).toStrictEqual(mockResponse);
	});
});

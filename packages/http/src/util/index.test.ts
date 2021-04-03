import { badRequest, internal, unauthorized } from '@hapi/boom';
import { Http2ServerResponse } from 'http2';

import { sendBoom } from '.';

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
		// @ts-ignore
		sendBoom(err, res);

		expect(res.statusCode).toBe(400);
		expect(res.setHeader).toHaveBeenCalledTimes(0);
		expect(res.end).toHaveBeenCalledWith(`{"statusCode":400,"error":"Bad Request","message":"Bad Request"}`);
	});

	test('with internal server error', () => {
		const err = internal();
		const res = new MockedResponse();
		// @ts-ignore
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
		// @ts-ignore
		sendBoom(err, res);

		expect(res.statusCode).toBe(401);
		expect(res.setHeader).toHaveBeenCalledTimes(1);
		expect(res.setHeader).toHaveBeenCalledWith('WWW-Authenticate', 'abc, def');
		expect(res.end).toHaveBeenCalledWith(`{"statusCode":401,"error":"Unauthorized","message":"foo"}`);
	});
});

import { badData } from '@hapi/boom';
import { Http2ServerRequest, Http2ServerResponse } from 'http2';
import { PassThrough } from 'stream';
import authorize from './authorize';
import { USER_ID_HEADER } from '../Constants';

let stream: PassThrough;
let headers: Record<string, string | string[]>;
let req: Http2ServerRequest;
let res: Http2ServerResponse;
let next: jest.Mock;

beforeEach(() => {
	stream = new PassThrough();
	headers = {};
	// @ts-ignore because ServerHttp2Stream is not constructable
	req = new Http2ServerRequest(stream, headers, {}, []);
	// @ts-ignore because ServerHttp2Stream is not constructable
	res = new Http2ServerResponse(stream);
	next = jest.fn();
});

test('missing user ID header', () => {
	authorize(req, res, next);
	expect(req).not.toHaveProperty('userId');
	expect(next).toHaveBeenCalledWith(badData(`missing "${USER_ID_HEADER}" header`));
});

test('has user ID header', () => {
	headers[USER_ID_HEADER] = 'foo';
	authorize(req, res, next);
	expect(req).toHaveProperty('userId', 'foo');
	expect(next).toHaveBeenCalledWith();
});

test('has multiple user ID headers', () => {
	headers[USER_ID_HEADER] = ['foo', 'bar'];
	authorize(req, res, next);
	expect(req).toHaveProperty('userId', 'foo');
	expect(next).toHaveBeenCalledWith();
});

test('missing next function & user ID header', () => {
	authorize(req, res);
	expect(req).not.toHaveProperty('userId');
});

test('missing next function', () => {
	headers[USER_ID_HEADER] = 'foo';
	authorize(req, res);
	expect(req).toHaveProperty('userId', 'foo');
});

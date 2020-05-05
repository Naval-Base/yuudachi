import { badRequest } from '@hapi/boom';
import { Http2ServerRequest, Http2ServerResponse } from 'http2';
import { PassThrough } from 'stream';
import bodyParser from './bodyParser';

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

test('missing content type', async () => {
	await bodyParser(req, res, next);
	expect(next).toHaveBeenCalledWith(badRequest('unexpected content type'));
	expect(stream.writableEnded).toBe(false);
});

test('invalid data', async () => {
	headers['content-type'] = 'application/json';
	stream.end('foo');
	await bodyParser(req, res, next);
	expect(next).toHaveBeenCalledWith(new SyntaxError('Unexpected token o in JSON at position 1'));
	expect(req).not.toHaveProperty('body');
});

test('valid data', async () => {
	headers['content-type'] = 'application/json';
	stream.end('{"foo": "bar"}');
	await bodyParser(req, res, next);
	expect(next).toHaveBeenCalledWith();
	expect(req).toHaveProperty('body', { foo: 'bar' });
});

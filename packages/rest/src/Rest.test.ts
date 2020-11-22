import { Amqp } from '@spectacles/brokers';
import Rest from './Rest';

jest.mock('@spectacles/brokers');

const mockedAmqp: jest.Mocked<Amqp> = new (Amqp as any)();

afterEach(() => {
	mockedAmqp.call.mockClear();
});

const serialize = (data: any) => Buffer.from(JSON.stringify(data));

test('constructs', () => {
	expect(() => new Rest('token', mockedAmqp)).not.toThrow();
});

test('has properties', () => {
	const rest = new Rest('token', mockedAmqp);
	expect(rest).toHaveProperty('token', 'token');
	expect(rest).toHaveProperty('broker', mockedAmqp);
});

test('sends get', async () => {
	const rest = new Rest('token', mockedAmqp);

	mockedAmqp.call.mockResolvedValue({
		status: 0,
		body: {
			status: 200,
			body: serialize({ abc: 'def' }),
		},
	});

	const res = await rest.get('/foo/bar');

	expect(mockedAmqp.call).toHaveBeenCalledTimes(1);
	expect(mockedAmqp.call).toHaveBeenCalledWith('REQUEST', {
		method: 'GET',
		path: '/foo/bar',
		headers: {
			Authorization: 'Bot token',
			'X-RateLimit-Precision': 'millisecond',
			'Content-Type': 'application/json',
		},
	});

	expect(res).toStrictEqual({ abc: 'def' });
});

test('sends post', async () => {
	const rest = new Rest('token', mockedAmqp);

	mockedAmqp.call.mockResolvedValue({
		status: 0,
		body: { status: 200, body: serialize('baz') },
	});

	const res = await rest.post('/foo/bar', { foo: 'bar' });

	expect(mockedAmqp.call).toHaveBeenCalledTimes(1);
	expect(mockedAmqp.call).toHaveBeenCalledWith('REQUEST', {
		method: 'POST',
		path: '/foo/bar',
		body: serialize({ foo: 'bar' }),
		headers: {
			Authorization: 'Bot token',
			'X-RateLimit-Precision': 'millisecond',
			'Content-Type': 'application/json',
		},
	});

	expect(res).toBe('baz');
});

test('sends put', async () => {
	const rest = new Rest('token', mockedAmqp);

	mockedAmqp.call.mockResolvedValue({
		status: 0,
		body: {
			status: 200,
			body: serialize(null),
		},
	});

	const res = await rest.put('/foo/bar', { foo: 'bar' });

	expect(mockedAmqp.call).toHaveBeenCalledTimes(1);
	expect(mockedAmqp.call).toHaveBeenCalledWith('REQUEST', {
		method: 'PUT',
		path: '/foo/bar',
		body: Buffer.from(JSON.stringify({ foo: 'bar' })),
		headers: {
			Authorization: 'Bot token',
			'X-RateLimit-Precision': 'millisecond',
			'Content-Type': 'application/json',
		},
	});

	expect(res).toBe(null);
});

test('sends patch', async () => {
	const rest = new Rest('token', mockedAmqp);

	mockedAmqp.call.mockResolvedValue({
		status: 0,
		body: {
			status: 200,
			body: serialize(null),
		},
	});

	const res = await rest.patch('/foo/bar', { foo: 'bar' });

	expect(mockedAmqp.call).toHaveBeenCalledTimes(1);
	expect(mockedAmqp.call).toHaveBeenCalledWith('REQUEST', {
		method: 'PATCH',
		path: '/foo/bar',
		body: Buffer.from(JSON.stringify({ foo: 'bar' })),
		headers: {
			Authorization: 'Bot token',
			'X-RateLimit-Precision': 'millisecond',
			'Content-Type': 'application/json',
		},
	});

	expect(res).toBe(null);
});

test('sends delete', async () => {
	const rest = new Rest('token', mockedAmqp);

	mockedAmqp.call.mockResolvedValue({
		status: 0,
		body: {
			status: 200,
			body: serialize(null),
		},
	});

	const res = await rest.delete('/foo/bar');

	expect(mockedAmqp.call).toHaveBeenCalledTimes(1);
	expect(mockedAmqp.call).toHaveBeenCalledWith('REQUEST', {
		method: 'DELETE',
		path: '/foo/bar',
		headers: {
			Authorization: 'Bot token',
			'X-RateLimit-Precision': 'millisecond',
			'Content-Type': 'application/json',
		},
	});

	expect(res).toBe(null);
});

test('throws error', async () => {
	const rest = new Rest('token', mockedAmqp);

	mockedAmqp.call.mockResolvedValue({
		status: 1,
		body: 'it broke!',
	});

	await expect(() => rest.get('/foo/bar')).rejects.toStrictEqual(new Error('it broke!'));

	expect(mockedAmqp.call).toHaveBeenCalledTimes(1);
	expect(mockedAmqp.call).toHaveBeenCalledWith('REQUEST', {
		method: 'GET',
		path: '/foo/bar',
		headers: {
			Authorization: 'Bot token',
			'X-RateLimit-Precision': 'millisecond',
			'Content-Type': 'application/json',
		},
	});
});

test('sends audit log reason', async () => {
	const rest = new Rest('token', mockedAmqp);

	mockedAmqp.call.mockResolvedValue({
		status: 0,
		body: {
			status: 200,
			body: serialize('foo'),
		},
	});

	const res = await rest.put('/foo/bar', null, { reason: 'some reason' });

	expect(mockedAmqp.call).toHaveBeenCalledTimes(1);
	expect(mockedAmqp.call).toHaveBeenCalledWith('REQUEST', {
		method: 'PUT',
		path: '/foo/bar',
		headers: {
			Authorization: 'Bot token',
			'X-RateLimit-Precision': 'millisecond',
			'Content-Type': 'application/json',
			'X-Audit-Log-Reason': 'some reason',
		},
	});

	expect(res).toBe('foo');
});

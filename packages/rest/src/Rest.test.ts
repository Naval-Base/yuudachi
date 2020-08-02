import { Amqp } from '@spectacles/brokers';
import Rest from './Rest';

jest.mock('@spectacles/brokers');

const mockedAmqp: jest.Mocked<Amqp> = new (Amqp as any)();

test('constructs', () => {
	expect(() => new Rest('token', mockedAmqp)).not.toThrow();
});

test('has properties', () => {
	const rest = new Rest('token', mockedAmqp);
	expect(rest).toHaveProperty('token', 'token');
	expect(rest).toHaveProperty('broker', mockedAmqp);
});

test('sends get', () => {
	const rest = new Rest('token', mockedAmqp);
	void rest.get('/foo/bar');

	mockedAmqp.call.mockResolvedValue({
		status: 0,
		body: {},
	});

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

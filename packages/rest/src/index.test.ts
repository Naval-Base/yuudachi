import { Amqp, AmqpOptions } from '@spectacles/brokers';
import { createAmqpBroker } from '.';

jest.mock('@spectacles/brokers');

const MockedAmqp = Amqp as jest.MockedClass<typeof Amqp>;

test('creates with no options', () => {
	const broker = createAmqpBroker('foo');
	expect(broker).toBeInstanceOf(MockedAmqp);

	expect(MockedAmqp).toHaveBeenCalledTimes(1);
});

test('de/serializes with msgpack', () => {
	const serialized = Buffer.from([
		0x82, 0xa7, 0x63, 0x6f, 0x6d, 0x70, 0x61, 0x63, 0x74, 0xc3, 0xa6, 0x73, 0x63, 0x68, 0x65, 0x6d, 0x61, 0x00,
	]);
	const deserialized = { compact: true, schema: 0 };

	const serialize = (MockedAmqp.mock.calls[0][1] as AmqpOptions).serialize;
	const deserialize = (MockedAmqp.mock.calls[0][1] as AmqpOptions).deserialize;

	expect(serialize!(deserialized)).toStrictEqual(serialized);
	expect(deserialize!(serialized)).toStrictEqual(deserialized);
});

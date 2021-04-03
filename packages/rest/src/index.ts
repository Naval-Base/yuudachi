import { encode, decode } from '@msgpack/msgpack';
import { Amqp, AmqpOptions } from '@spectacles/brokers';

import HttpException from './HttpException';
import Rest, { RequestOptions } from './Rest';

export function createAmqpBroker(group: string, options: AmqpOptions = {}): Amqp {
	return new Amqp(group, {
		...options,
		serialize: (data: any) => {
			const encoded = encode(data);
			return Buffer.from(encoded.buffer, encoded.byteOffset, encoded.byteLength);
		},
		deserialize: (data: Buffer | Uint8Array) => {
			return decode(data);
		},
	});
}

export { Rest, HttpException, RequestOptions };
export default Rest;

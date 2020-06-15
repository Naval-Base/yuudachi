import { isBoom, Boom, notFound } from '@hapi/boom';
import { createServer } from 'http';
import polka from 'polka';
import { sendBoom } from './util';

export default function createApp() {
	return polka<polka.Request>({
		onError(err, _, res) {
			console.error(err); // TODO: better error logging
			res.setHeader('content-type', 'application/json');
			if (isBoom(err as any)) sendBoom(err as any, res);
			else sendBoom(new Boom(err), res);
		},
		onNoMatch(_, res) {
			res.setHeader('content-type', 'application/json');
			sendBoom(notFound(), res);
		},
		server: createServer(),
	});
}

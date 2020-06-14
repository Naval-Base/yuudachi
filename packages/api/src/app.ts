import { isBoom, Boom, notFound } from '@hapi/boom';
import { createServer } from 'http';
import * as polka from 'polka';
import { sendBoom } from './util';

let _polka: typeof polka;

const __polka: any = polka;
if (__polka.default) _polka = __polka.default;
else _polka = polka;

export default function createApp() {
	return _polka<polka.Request>({
		onError(err, req, res) {
			console.error(err); // TODO: better error logging
			res.setHeader('content-type', 'application/json');
			if (isBoom(err as any)) sendBoom(err as any, res);
			else sendBoom(new Boom(err), res);
		},
		onNoMatch(req, res) {
			res.setHeader('content-type', 'application/json');
			sendBoom(notFound(), res);
		},
		server: createServer(),
	});
}

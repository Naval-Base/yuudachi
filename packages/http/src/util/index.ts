import { Boom } from '@hapi/boom';
import { Response } from 'polka';

export * from './auth';

export function sendBoom(err: Boom, res: Response) {
	res.statusCode = err.output.statusCode;
	for (const [header, value] of Object.entries(err.output.headers)) {
		if (value) {
			res.setHeader(header, value);
		}
	}

	res.end(JSON.stringify(err.output.payload));
}

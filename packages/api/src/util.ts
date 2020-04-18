import { Boom } from '@hapi/boom';
import { Response } from 'polka';

export function sendBoom(err: Boom, res: Response) {
	res.statusCode = err.output.statusCode;
	for (const [header, value] of Object.entries(err.output.headers)) {
		res.setHeader(header, value);
	}

	res.end(JSON.stringify(err.output.payload));
}

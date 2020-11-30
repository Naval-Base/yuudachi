import { Request, Response, NextHandler } from 'polka';
import { badRequest, badData } from '@hapi/boom';

export default async function bodyParser(req: Request, _: Response, next?: NextHandler) {
	if (!req.headers['content-type']?.startsWith('application/json')) {
		return next?.(badRequest('unexpected content type'));
	}

	req.setEncoding('utf8');
	try {
		let data = '';
		for await (const chunk of req) data += chunk;
		req.body = JSON.parse(data);

		next?.();
	} catch (e) {
		next?.(badData(e?.toString()));
	}
}

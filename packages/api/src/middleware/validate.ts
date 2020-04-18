import * as Boom from '@hapi/boom';
import { AnySchema } from '@hapi/joi';
import { Request, Response, NextHandler } from 'polka';

export default (schema: AnySchema, prop: keyof Request = 'body') => (req: Request, res: Response, next?: NextHandler) => {
	const result = schema.validate(req[prop]);

	if (result.error) {
		next?.(Boom.boomify(result.error, { statusCode: 422 }));
	} else {
		req.body = result.value;
		next?.();
	}
};

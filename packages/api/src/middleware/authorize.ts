import { badRequest } from '@hapi/boom';
import { Request, Response, NextHandler } from 'polka';

import { USER_ID_HEADER } from '../Constants';

export default function authorize(req: Request, res: Response, next?: NextHandler) {
	const userId = req.headers[USER_ID_HEADER] as string;
	if (!userId) {
		return next?.(badRequest(`missing "${USER_ID_HEADER}" header`));
	}

	// TODO: verify user ID with authorization server
	req.userId = userId;
	next?.();
}

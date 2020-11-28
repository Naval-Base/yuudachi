import Joi from 'joi';
import { Request, Response, NextHandler } from 'polka';
import { injectable } from 'tsyringe';
import { Route } from '@yuudachi/http';
import { Constants } from '@yuudachi/core';

import { validate, bodyParser } from '../../../../middleware';

const { USER_ID_HEADER } = Constants;

enum Actions {
	USERS_ME = 'users_me',
}

interface UsersMeActionPayload {
	action: {
		name: Actions.USERS_ME;
	};
	input: unknown;
	session_variables: Record<string, string>;
}

@injectable()
export default class HasuraUsersMeActionHandler extends Route {
	public middleware = [
		bodyParser,
		validate(
			Joi.object()
				.keys({
					action: Joi.object()
						.keys({
							name: Joi.string().valid(Actions.USERS_ME).required(),
						})
						.required(),
					input: Joi.object().required(),
					session_variables: Joi.object().required(),
				})
				.required(),
		),
	];

	public handle(req: Request, res: Response, next: NextHandler) {
		if (!req.body) {
			return next('uh oh, something broke');
		}

		const body: UsersMeActionPayload = req.body as any;
		const userId = body.session_variables[USER_ID_HEADER];

		req.statusCode = 200;
		res.end(JSON.stringify({ user_id: userId }));
	}
}

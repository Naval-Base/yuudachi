import * as Joi from '@hapi/joi';
import { Request, Response, NextHandler } from 'polka';
import { injectable } from 'tsyringe';

import Route from '../../../Route';
import { validate } from '../../../middleware';
import CaseManager, { Case } from '../../../managers/CaseManager';

enum Actions {
	MOD_ACTION = 'mod_action',
}

interface ActionPayload {
	action: Actions;
	input: any;
	session_variables: Record<string, string>;
}

interface ModActionPayload extends ActionPayload {
	action: Actions.MOD_ACTION;
	input: Case;
}

type Action = ModActionPayload; // | other types

@injectable()
export default class HasuraActionHandler implements Route {
	constructor(
		public readonly caseManager: CaseManager,
	) {}

	public middleware = [
		validate(Joi.object({
			action: Joi.string().required(),
			input: Joi.object().required(),
			session_variables: Joi.object().required(),
		})),
	];

	public async handle(req: Request, res: Response, next: NextHandler) {
		if (!req.body) return next('uh oh, something broke');

		const body: Action = req.body as any;

		switch (body.action) {
			case Actions.MOD_ACTION:
				await this.caseManager.create(body.input);
		}

		res.statusCode = 200;
		res.end();
	}
}

import * as Boom from '@hapi/boom';
import Joi from '@hapi/joi';
import validate from './validate';

let next: jest.Mock;

beforeEach(() => {
	next = jest.fn();
});

class ValidationError extends Error {}

test('invalid schema', () => {
	const validator = validate(Joi.object({ foo: Joi.string() }));
	validator({ body: { foo: 1 } }, {}, next);
	expect(next).toHaveBeenCalledWith(Boom.boomify(new ValidationError('"foo" must be a string'), { statusCode: 422 }));
});

test('valid schema', () => {
	const validator = validate(Joi.object({ foo: Joi.string(), bar: Joi.number().default(5) }));
	const req = { body: { foo: 'bar' } };
	validator(req, {}, next);
	expect(next).toHaveBeenCalledWith();
	expect(req).toHaveProperty('body', { foo: 'bar', bar: 5 });
});

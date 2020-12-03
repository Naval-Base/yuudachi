import 'reflect-metadata';

import supertest from 'supertest';
import { container } from 'tsyringe';
import { Request, Response, NextHandler } from 'polka';

import { createApp } from './app';
import { Route, RouteMethod } from './Route';

class TestRoute extends Route {
	public handle(_: Request, __: Response, next: NextHandler) {
		return next(new Error('uh oh, something broke'));
	}
}

class TestRoute2 extends Route {
	public handle() {
		throw new Error('uh oh, something broke');
	}
}

const app = createApp();
const route = container.resolve(TestRoute);
const route2 = container.resolve(TestRoute2);
route.register({ path: '/test', method: RouteMethod.GET }, app);
route2.register({ path: '/test2', method: RouteMethod.GET }, app);
app.listen(0);

afterAll(() => {
	app.server.close();
});

test('error un-boomified', async () => {
	const res = await supertest(app.server).get('/api/test').expect(500);

	expect(res.body).toStrictEqual({
		error: 'Internal Server Error',
		message: 'An internal server error occurred',
		statusCode: 500,
	});
});

test('no match', async () => {
	const res = await supertest(app.server).get('/api/test/7890').expect(404);

	expect(res.body).toStrictEqual({
		error: 'Not Found',
		message: 'Not Found',
		statusCode: 404,
	});
});

test('throw error', async () => {
	const res = await supertest(app.server).get('/api/test2').expect(500);

	expect(res.body).toStrictEqual({
		error: 'Internal Server Error',
		message: 'An internal server error occurred',
		statusCode: 500,
	});
});

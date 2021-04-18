import 'reflect-metadata';

import supertest from 'supertest';
import { container } from 'tsyringe';
import { createApp, RouteMethod } from '@yuudachi/http';
import { HttpException } from '@yuudachi/rest';

import UpdateCaseRoute from './patch';
import CaseManager from '../../../../managers/CaseManager';

jest.mock('../../../../managers/CaseManager');

const mockedCaseManager: jest.Mocked<CaseManager> = new (CaseManager as any)();
container.register(CaseManager, { useValue: mockedCaseManager });

afterEach(() => {
	mockedCaseManager.update.mockReset();
});

const app = createApp();
const route = container.resolve(UpdateCaseRoute);
// @ts-ignore
route.register({ path: '/test/:guildId', method: RouteMethod.PATCH }, app);
app.listen(0);

afterAll(() => {
	app.server.close();
});

describe('invalid data', () => {
	test('junk properties', async () => {
		const res = await supertest(app.server).patch('/api/test/7890').type('json').send({ foo: 'bar' }).expect(422);

		expect(res.body).toStrictEqual({
			error: 'Unprocessable Entity',
			message: '"foo" is not allowed',
			statusCode: 422,
		});
	});

	test('invalid types', async () => {
		const res = await supertest(app.server)
			.patch('/api/test/7890')
			.type('json')
			.send({
				cases: [{ caseId: null }],
			})
			.expect(422);

		expect(res.body).toStrictEqual({
			error: 'Unprocessable Entity',
			message: '"cases[0].caseId" must be a number',
			statusCode: 422,
		});
	});

	test('wrong properties', async () => {
		const res = await supertest(app.server)
			.patch('/api/test/7890')
			.type('json')
			.send({
				cases: [
					{
						caseId: 1,
						deleteMessageDays: 5,
					},
				],
			})
			.expect(422);

		expect(res.body).toStrictEqual({
			error: 'Unprocessable Entity',
			message: '"cases[0].deleteMessageDays" is not allowed',
			statusCode: 422,
		});
	});
});

test('reason patch', async () => {
	mockedCaseManager.update.mockImplementation((case_): any => {
		case_.caseId = 1;
		case_.reason = 'foo';
		return Promise.resolve(case_);
	});

	const res = await supertest(app.server)
		.patch('/api/test/7890')
		.type('json')
		.send({
			cases: [
				{
					caseId: 1,
					reason: 'foo',
				},
			],
		});

	expect(res.body).toStrictEqual({
		cases: [
			{
				caseId: 1,
				guildId: '7890',
				reason: 'foo',
			},
		],
	});
});

test('handles 404 HttpException while creating cases', async () => {
	mockedCaseManager.update.mockRejectedValue(new HttpException(404, 'not found'));

	const res = await supertest(app.server)
		.patch('/api/test/7890')
		.type('json')
		.send({
			cases: [
				{
					caseId: 1,
					reason: 'foo',
				},
			],
		});

	expect(res.status).toBe(404);
});

test('handles generic exception while creating cases', async () => {
	mockedCaseManager.update.mockRejectedValue(new Error('oops'));

	const res = await supertest(app.server)
		.patch('/api/test/7890')
		.type('json')
		.send({
			cases: [
				{
					caseId: 1,
					reason: 'foo',
				},
			],
		});

	expect(res.status).toBe(500);
});

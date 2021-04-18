import 'reflect-metadata';

import { CaseAction } from '@yuudachi/types';
import supertest from 'supertest';
import { container } from 'tsyringe';
import { createApp, RouteMethod } from '@yuudachi/http';
import { HttpException } from '@yuudachi/rest';

import CreateCaseRoute from './post';
import CaseManager from '../../../../managers/CaseManager';

jest.mock('../../../../managers/CaseManager');

const mockedCaseManager: jest.Mocked<CaseManager> = new (CaseManager as any)();
container.register(CaseManager, { useValue: mockedCaseManager });

afterEach(() => {
	mockedCaseManager.create.mockReset();
});

const app = createApp();
const route = container.resolve(CreateCaseRoute);
// @ts-ignore
route.register({ path: '/test/:guildId', method: RouteMethod.POST }, app);
app.listen(0);

afterAll(() => {
	app.server.close();
});

describe('invalid data', () => {
	test('junk properties', async () => {
		const res = await supertest(app.server).post('/api/test/7890').type('json').send({ foo: 'bar' }).expect(422);

		expect(res.body).toStrictEqual({
			error: 'Unprocessable Entity',
			message: '"foo" is not allowed',
			statusCode: 422,
		});
	});

	test('invalid types', async () => {
		const res = await supertest(app.server)
			.post('/api/test/7890')
			.type('json')
			.send({
				cases: [{ action: 7 }],
			})
			.expect(422);

		expect(res.body).toStrictEqual({
			error: 'Unprocessable Entity',
			message: '"cases[0].action" must be less than or equal to 6',
			statusCode: 422,
		});
	});

	test('wrong properties', async () => {
		const res = await supertest(app.server)
			.post('/api/test/7890')
			.type('json')
			.send({
				cases: [
					{
						action: CaseAction.ROLE,
						roleId: '12345678912345678912',
						reason: 'foo',
						moderatorId: '09876543210987654321',
						targetId: '34567891234567891234',
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

test('role action', async () => {
	mockedCaseManager.create.mockImplementation((case_) => {
		case_.caseId = 1;
		return Promise.resolve(case_);
	});

	const res = await supertest(app.server)
		.post('/api/test/7890')
		.type('json')
		.send({
			cases: [
				{
					action: CaseAction.ROLE,
					roleId: '12345678912345678912',
					reason: 'foo',
					moderatorId: '09876543210987654321',
					targetId: '34567891234567891234',
				},
			],
		});

	expect(res.body).toStrictEqual({
		cases: [
			{
				caseId: 1,
				action: CaseAction.ROLE,
				roleId: '12345678912345678912',
				moderatorId: '09876543210987654321',
				guildId: '7890',
				reason: 'foo',
				targetId: '34567891234567891234',
			},
		],
	});
});

test('handles 404 HttpException while creating cases', async () => {
	mockedCaseManager.create.mockRejectedValue(new HttpException(404, 'not found'));

	const res = await supertest(app.server)
		.post('/api/test/7890')
		.type('json')
		.send({
			cases: [
				{
					action: CaseAction.KICK,
					reason: 'foo',
					moderatorId: '09876543210987654321',
					targetId: '34567891234567891234',
				},
			],
		});

	expect(res.status).toBe(404);
});

test('handles 403 HttpException while creating cases', async () => {
	mockedCaseManager.create.mockRejectedValue(new HttpException(403, 'forbidden'));

	const res = await supertest(app.server)
		.post('/api/test/7890')
		.type('json')
		.send({
			cases: [
				{
					action: CaseAction.KICK,
					reason: 'foo',
					moderatorId: '09876543210987654321',
					targetId: '34567891234567891234',
				},
			],
		});

	expect(res.status).toBe(403);
});

test('handles generic exception while creating cases', async () => {
	mockedCaseManager.create.mockRejectedValue(new Error('oops'));

	const res = await supertest(app.server)
		.post('/api/test/7890')
		.type('json')
		.send({
			cases: [
				{
					action: CaseAction.KICK,
					reason: 'foo',
					moderatorId: '09876543210987654321',
					targetId: '34567891234567891234',
				},
			],
		});

	expect(res.status).toBe(500);
});

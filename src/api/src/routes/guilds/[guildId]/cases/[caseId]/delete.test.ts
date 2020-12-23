import 'reflect-metadata';

import supertest from 'supertest';
import { container } from 'tsyringe';
import { createApp, RouteMethod } from '@yuudachi/http';
import { HttpException } from '@yuudachi/rest';

import DeleteCaseRoute from './delete';
import CaseManager from '../../../../../managers/CaseManager';

jest.mock('../../../../../managers/CaseManager');

const mockedCaseManager: jest.Mocked<CaseManager> = new (CaseManager as any)();
container.register(CaseManager, { useValue: mockedCaseManager });

afterEach(() => {
	mockedCaseManager.delete.mockReset();
});

const app = createApp();
const route = container.resolve(DeleteCaseRoute);
route.register({ path: '/test/:guildId/cases/:caseId', method: RouteMethod.DELETE }, app);
app.listen(0);

afterAll(() => {
	app.server.close();
});

test('delete case', async () => {
	mockedCaseManager.delete.mockImplementation((): any => Promise.resolve());

	const res = await supertest(app.server).delete('/api/test/7890/cases/1234');

	expect(res.status).toBe(201);
});

test('handles 404 HttpException while creating cases', async () => {
	mockedCaseManager.delete.mockRejectedValue(new HttpException(404, 'not found'));

	const res = await supertest(app.server).delete('/api/test/7890/cases/1234');

	expect(res.status).toBe(404);
});

test('handles generic exception while creating cases', async () => {
	mockedCaseManager.delete.mockRejectedValue(new Error('oops'));

	const res = await supertest(app.server).delete('/api/test/7890/cases/1234');

	expect(res.status).toBe(500);
});

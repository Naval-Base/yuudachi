import supertest from 'supertest';

import authorize from './authorize';
import { USER_ID_HEADER } from '../Constants';
import createApp from '../app';

const mockHandler = jest.fn((_, res) => res.end());

afterEach(() => {
	mockHandler.mockClear();
});

const app = createApp();
app.use(authorize);
app.get('/test', mockHandler);
app.listen(0);

afterAll(() => {
	app.server.close();
});

test('missing user ID header', async () => {
	await supertest(app.server).get('/test').expect(400);

	expect(mockHandler).not.toHaveBeenCalled();
});

test('has user ID header', async () => {
	await supertest(app.server).get('/test').set(USER_ID_HEADER, 'foo').expect(200);

	expect(mockHandler).toHaveBeenCalled();
	expect(mockHandler.mock.calls[0][0]).toHaveProperty('userId', 'foo');
});

import supertest from 'supertest';
import bodyParser from './bodyParser';
import createApp from '../app';

const mockHandler = jest.fn((_, res) => res.end());

afterEach(() => {
	mockHandler.mockClear();
});

const app = createApp();
app.use(bodyParser);
app.post('/test1', mockHandler);
app.listen(0);

afterAll(() => {
	app.server.close();
});

test('missing content type', async () => {
	await supertest(app.server).post('/test1').expect(400);

	expect(mockHandler).not.toHaveBeenCalled();
});

test('invalid data', async () => {
	await supertest(app.server).post('/test1').type('json').send('foo').expect(422);

	expect(mockHandler).not.toHaveBeenCalled();
});

test('valid data', async () => {
	await supertest(app.server).post('/test1').type('json').send({ foo: 'bar' }).expect(200);

	expect(mockHandler).toHaveBeenCalledTimes(1);
	expect(mockHandler.mock.calls[0][0]).toHaveProperty('body');
});

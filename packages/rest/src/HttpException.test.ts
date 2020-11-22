import HttpException from './HttpException';

test('has properties', () => {
	const ex = new HttpException(999, 'foo');
	expect(ex).toHaveProperty('status', 999);
	expect(ex).toHaveProperty('body', 'foo');
	expect(ex).toHaveProperty('message', '999: foo');
});

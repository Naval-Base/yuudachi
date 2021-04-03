import { sep } from 'path';

import { Route, pathToRouteInfo, RouteMethod } from './Route';

test('invalid file name', () => {
	expect(pathToRouteInfo('foo')).toBeNull();
});

test('non-js file', () => {
	expect(pathToRouteInfo('post.rs')).toBeNull();
});

test('register', () => {
	class TestRoute extends Route {
		public handle() {
			// empty
		}
	}

	const mockServer = {
		get: jest.fn(),
	};

	const route = new TestRoute();
	route.register(
		{
			method: RouteMethod.GET,
			path: '/test',
		},
		mockServer as any,
	);

	expect(mockServer.get).toHaveBeenCalledWith('/api/test', expect.any(Function));
});

describe('routes', () => {
	test('[post] root', () => {
		const route = pathToRouteInfo('post.js');
		expect(route).not.toBeNull();
		expect(route!.path).toBe('/');
		expect(route!.method).toBe('post');
	});

	test('[get] subfolder', () => {
		const route = pathToRouteInfo(`${sep}foo${sep}bar${sep}get.js`);
		expect(route).not.toBeNull();
		expect(route!.path).toBe('/foo/bar');
		expect(route!.method).toBe('get');
	});

	test('[patch] subfolder with params', () => {
		const route = pathToRouteInfo(`ab${sep}[c]${sep}patch.js`);
		expect(route).not.toBeNull();
		expect(route!.path).toBe('/ab/:c');
		expect(route!.method).toBe('patch');
	});

	test('[put] subfolder with params', () => {
		const route = pathToRouteInfo(`[abc]${sep}def${sep}ghi${sep}put.js`);
		expect(route).not.toBeNull();
		expect(route!.path).toBe('/:abc/def/ghi');
		expect(route!.method).toBe('put');
	});

	test('[delete] subfolder with params', () => {
		const route = pathToRouteInfo(`wx${sep}y${sep}[z]${sep}delete.js`);
		expect(route).not.toBeNull();
		expect(route!.path).toBe('/wx/y/:z');
		expect(route!.method).toBe('delete');
	});

	test('multiple params', () => {
		const route = pathToRouteInfo(`a${sep}b${sep}[c]${sep}d${sep}[e]${sep}get.js`);
		expect(route).not.toBeNull();
		expect(route!.path).toBe('/a/b/:c/d/:e');
		expect(route!.method).toBe('get');
	});
});

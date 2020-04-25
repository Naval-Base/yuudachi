import { pathToRouteInfo } from './Route';

test('invalid file name', () => {
	expect(pathToRouteInfo('foo')).toBeNull();
});

test('non-js file', () => {
	expect(pathToRouteInfo('post.rs')).toBeNull();
});

test('[post] root', () => {
	const route = pathToRouteInfo('post.js');
	expect(route).not.toBeNull();
	expect(route!.path).toBe('/');
	expect(route!.method).toBe('post');
});

test('[get] subfolder', () => {
	const route = pathToRouteInfo('foo/bar/get.js');
	expect(route).not.toBeNull();
	expect(route!.path).toBe('/foo/bar');
	expect(route!.method).toBe('get');
});

test('[patch] subfolder with params', () => {
	const route = pathToRouteInfo('ab/[c]/patch.js');
	expect(route).not.toBeNull();
	expect(route!.path).toBe('/ab/:c');
	expect(route!.method).toBe('patch');
});

test('[put] subfolder with params', () => {
	const route = pathToRouteInfo('[abc]/def/ghi/put.js');
	expect(route).not.toBeNull();
	expect(route!.path).toBe('/:abc/def/ghi');
	expect(route!.method).toBe('put');
});

test('[delete] subfolder with params', () => {
	const route = pathToRouteInfo('wx/y/[z]/delete.js');
	expect(route).not.toBeNull();
	expect(route!.path).toBe('/wx/y/:z');
	expect(route!.method).toBe('delete');
});

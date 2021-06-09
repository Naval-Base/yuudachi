import { basename, extname } from 'path';

export default interface Component {
	name?: string;
	execute(message: any, args: unknown, locale: string): unknown | Promise<unknown>;
}

export interface ComponentInfo {
	name: string;
}

export function componentInfo(path: string): ComponentInfo | null {
	if (extname(path) !== '.js') {
		return null;
	}

	return { name: basename(path, '.js') };
}

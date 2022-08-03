import type { InjectionToken } from 'tsyringe';

export function dynamicImport<T, R = Promise<{ default: InjectionToken<T> }>>(path: string) {
	return import(path) as unknown as R;
}

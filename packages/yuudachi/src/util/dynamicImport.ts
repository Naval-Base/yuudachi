export function dynamicImport<T, R = () => Promise<{ default: T }>>(factory: () => Promise<any>) {
	return factory as unknown as R;
}

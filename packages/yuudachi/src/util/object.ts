export function removeUndefinedKeys<T extends Record<string, unknown>>(obj: T): T {
	return Object.entries(obj).reduce<Record<string, unknown>>((acc, [key, value]) => {
		if (value !== undefined) {
			acc[key] = value;
		}

		return acc;
	}, {}) as T;
}

export function transformHashset<T>(
	initial: Record<string, string>,
	transformer: (element: string) => T,
): Record<string, T> {
	return Object.fromEntries(Object.entries(initial).map(([key, value]) => [key, transformer(value)]));
}

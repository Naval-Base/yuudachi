/**
 * Validate whether two arrays are the same based on Array#includes
 * Returns undefined if either is undefined
 *
 * @param a - The first array
 * @param b - The other array
 * @returns Whether the arrays are considered the same
 */
export function arrayEquals<T>(a?: T[], b?: T[]) {
	if (!a || !b) {
		return false;
	}

	if (a.length !== b.length) {
		return false;
	}

	return a.every((entry) => b.includes(entry));
}

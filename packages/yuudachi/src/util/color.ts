import kleur from 'kleur';

type IPredicate<T> = (...args: T[]) => boolean;

interface PredicateEntry<T> {
	color: (a0: string | number) => string;
	predicate: IPredicate<T>;
}

/**
 * Color a string derived from a determinant based on prediactes of said determinant
 * @param determinant - The structure to determine color and return string by
 * @param stringExtractor - Function to derive the return string from
 * @param colorPredicates  - Predicate structure to determine color by
 * @returns The colored string
 */
function colorBasedOnDeterminant<T>(
	determinant: T,
	stringExtractor: (a0: T) => string,
	predicates: PredicateEntry<T>[],
): string {
	kleur.enabled = true;

	const res = stringExtractor(determinant);
	for (const { color, predicate } of predicates) {
		if (predicate(determinant)) {
			return color(res);
		}
	}
	return res;
}

/**
 * Color a string based on timestamp difference.
 * red: < 2 weeks
 * yellow: < 4 weeks
 * cyan: < 1 months
 * green > 1 year
 * @param diff - The  difference to determine color by
 * @param colorString - The string to color
 * @returns Colored string
 */
export function colorBasedOnDifference(diff: number, colorString: string) {
	return colorBasedOnDeterminant<number>(diff, () => colorString, [
		{
			color: kleur.red,
			predicate: () => diff < 1000 * 60 * 60 * 24 * 7 * 2,
		},
		{
			color: kleur.yellow,
			predicate: () => diff < 1000 * 60 * 60 * 24 * 7 * 4,
		},
		{
			color: kleur.cyan,
			predicate: () => diff < 1000 * 60 * 60 * 24 * 7 * 12,
		},
		{
			color: kleur.green,
			predicate: () => diff > 1000 * 60 * 60 * 24 * 7 * 4 * 12,
		},
	]);
}

/**
 * Color a string based on timestamp difference.
 * none: true
 * red: false
 * @param bool - The  difference to determine color by
 * @param colorString - The string to color
 * @returns Colored string
 */
export function colorBasedOnBoolean(bool: boolean, colorString: string) {
	return colorBasedOnDeterminant<boolean>(bool, () => colorString, [
		{
			color: (s) => s.toString(),
			predicate: () => bool,
		},
		{
			color: kleur.red,
			predicate: () => !bool,
		},
	]);
}

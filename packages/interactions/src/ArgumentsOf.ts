import { APIGuildMember, APIPartialChannel, APIRole, APIUser, Permissions } from 'discord-api-types/v8';

type Command = Readonly<{
	name: string;
	description: string;
	options?: readonly Option[];
}>;

type Option = Readonly<
	{
		name: string;
		description: string;
		required?: boolean;
	} & (
		| {
				type: 1 | 2;
				options?: readonly Option[];
		  }
		| {
				type: 3;
				choices?: readonly Readonly<{ name: string; value: string }>[];
		  }
		| {
				type: 4;
				choices?: readonly Readonly<{ name: string; value: number }>[];
		  }
		| {
				type: 5 | 6 | 7 | 8;
		  }
	)
>;

type Simplify<T> = T extends unknown ? { [K in keyof T]: Simplify<T[K]> } : T;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

type TypeIdToType<T, O, C> = T extends 1
	? ArgumentsOfRaw<O>
	: T extends 2
	? ArgumentsOfRaw<O>
	: T extends 3
	? C extends readonly { value: string }[]
		? C[number]['value']
		: string
	: T extends 4
	? C extends readonly { value: number }[]
		? C[number]['value']
		: number
	: T extends 5
	? boolean
	: T extends 6
	? APIGuildMember & { user: APIUser; permissions: Permissions }
	: T extends 7
	? APIPartialChannel & { permissions: Permissions }
	: T extends 8
	? APIRole
	: never;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type OptionToObject<O> = O extends {
	name: infer K;
	type: infer T;
	required?: infer R;
	options?: infer O;
	choices?: infer C;
}
	? K extends string
		? R extends true
			? { [k in K]: TypeIdToType<T, O, C> }
			: T extends 1 | 2 | 5
			? { [k in K]: TypeIdToType<T, O, C> }
			: { [k in K]?: TypeIdToType<T, O, C> }
		: never
	: never;

type ArgumentsOfRaw<O> = O extends readonly any[] ? UnionToIntersection<OptionToObject<O[number]>> : never;

export type ArgumentsOf<C extends Command> = C extends { options: readonly Option[] }
	? Simplify<UnionToIntersection<OptionToObject<C['options'][number]>>>
	: unknown;

import type { Merge } from "type-fest";

export type PartialAndUndefinedOnNull<T> = T extends Record<any, any>
	? {
			[KeyType in keyof T as null extends T[KeyType] ? KeyType : never]?: T[KeyType] | null;
	  } extends infer U
		? Merge<
				{
					[KeyType in keyof T as KeyType extends keyof U ? never : KeyType]: T[KeyType];
				},
				U
		  >
		: never
	: T;

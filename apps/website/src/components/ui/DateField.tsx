"use client";

import type { ReactNode } from "react";
import {
	DateField as RACDateField,
	type DateFieldProps as RACDateFieldProps,
	DateInput as RACDateInput,
	type DateInputProps as RACDateInputProps,
	DateSegment as RACDateSegment,
	type DateValue as RACDateValue,
	type ValidationResult,
} from "react-aria-components";
import { inputStyles } from "@/components/ui/Input";
import { cva } from "@/styles/cva";
import { composeTailwindRenderProps } from "@/styles/util";

export const segmentStyles = cva({
	base: "inline shrink-0 text-base-lg tracking-wider text-base-neutral-900 uppercase tabular-nums caret-transparent outline-hidden forced-color-adjust-none focus:outline-hidden sm:text-base-md dark:text-base-neutral-40 forced-colors:text-[ButtonText] type-literal:px-0",
	variants: {
		isPlaceholder: {
			true: "text-base-neutral-400 dark:text-base-neutral-500",
		},
		isFocused: {
			true: "rounded bg-base-tangerine-300 text-base-neutral-900 dark:text-base-neutral-40 forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]",
			false: null,
		},
	},
});

export function DateInput(props: Omit<RACDateInputProps, "children">) {
	return (
		<span className="relative block" data-slot="control">
			<RACDateInput {...props} className={inputStyles}>
				{(segment) => <RACDateSegment className={segmentStyles} segment={segment} />}
			</RACDateInput>
		</span>
	);
}

export type DateFieldProps<Type extends RACDateValue> = RACDateFieldProps<Type> & {
	readonly description?: string;
	readonly errorMessage?: string | ((validation: ValidationResult) => string) | undefined;
	readonly label?: ReactNode | string;
	readonly prefix?: ReactNode;
	readonly suffix?: ReactNode;
};

export function DateField<Type extends RACDateValue>(props: DateFieldProps<Type>) {
	return (
		<RACDateField
			{...props}
			className={composeTailwindRenderProps(props.className, "group flex w-full flex-col gap-1")}
			data-slot="control"
		/>
	);
}

"use client";

import { Group as RACGroup, Input as RACInput, composeRenderProps } from "react-aria-components";
import type { GroupProps as RACGroupProps, InputProps as RACInputProps } from "react-aria-components";
import { compose, cva } from "@/styles/cva";
import { focusRing } from "@/styles/ui/focusRing";

export const inputGroupStyles = cva({
	base: [
		"relative isolate block",
		// Icon
		"has-[>[data-slot=icon]:first-child]:[&_input]:pl-(--input-gutter-start,--spacing(11)) has-[>[data-slot=icon]:last-child]:[&_input]:pr-(--input-gutter-end,--spacing(11))",
		"*:data-[slot=icon]:pointer-events-none *:data-[slot=icon]:absolute *:data-[slot=icon]:top-2 *:data-[slot=icon]:z-10 *:data-[slot=icon]:size-6 *:data-[slot=icon]:shrink-0",
		"[&>[data-slot=icon]:first-child]:left-3 [&>[data-slot=icon]:last-child]:right-3",
		// Text
		"has-[[data-slot=text]:first-child]:[&_input]:pl-[calc(var(--input-gutter-start,0px)+--spacing(7.5))] has-[[data-slot=text]:last-child]:[&_input]:pr-[calc(var(--input-gutter-end,0px)+--spacing(7.5))]",
		"*:data-[slot=text]:absolute *:data-[slot=text]:top-0 *:data-[slot=text]:z-10 *:data-[slot=text]:h-full *:data-[slot=text]:max-w-fit *:data-[slot=text]:grow *:data-[slot=text]:place-content-center [&>[data-slot='text']:not([class*='pointer-events'])]:pointer-events-none",
		"[&>[data-slot=text]:first-child:not([class*='left-'])]:left-3 [&>[data-slot=text]:last-child:not([class*='right-'])]:right-3",
		// Button
		"has-[>button:first-child]:[&_input]:pl-(--input-gutter-start,--spacing(11)) has-[>button:last-child]:[&_input]:pr-(--input-gutter-end,--spacing(11))",
		"*:[button]:absolute *:[button]:top-0 *:[button]:z-10",
		"[&>button:first-child]:left-1.5 [&>button:last-child]:right-1.5",
	],
});

export function InputGroup(props: RACGroupProps) {
	return (
		<RACGroup
			{...props}
			className={composeRenderProps(props.className, (className, renderProps) =>
				inputGroupStyles({
					...renderProps,
					className,
				}),
			)}
			data-slot="control"
		/>
	);
}

export const inputStyles = compose(
	focusRing,
	cva({
		base: [
			"relative block h-10 w-full appearance-none rounded-sm border px-3 py-2.5 transition duration-200 ease-out forced-colors:outline-[Highlight]",
			"text-base-neutral-900 placeholder:text-base-neutral-400 dark:placeholder:text-base-neutral-500 dark:text-base-neutral-40 text-base-lg sm:text-base-md",
			"bg-base-neutral-0 border-base-neutral-300 dark:bg-base-neutral-800 dark:border-base-neutral-500",
			"hover:border-base-neutral-200 dark:hover:border-base-neutral-600",
			"focus:border-base-neutral-200 dark:focus:border-base-neutral-600",
			"disabled:opacity-38 in-disabled:opacity-38 forced-colors:disabled:border forced-colors:disabled:border-[GrayText] forced-colors:in-disabled:border forced-colors:in-disabled:border-[GrayText]",
			"group-invalid:border-base-sunset-500 forced-colors:group-invalid:border-[Mark]",
			"group-invalid:hover:border-base-sunset-200 dark:group-invalid:hover:border-base-sunset-700",
			"group-invalid:focus:border-base-sunset-200 dark:group-invalid:focus:border-base-sunset-700",
		],
		variants: {
			isFocused: {
				true: "outline-2",
				false: "outline-0",
			},
			isFocusWithin: {
				true: "outline-2",
				false: "outline-0",
			},
		},
	}),
);

export type InputProps = RACInputProps;

export function Input(props: InputProps) {
	return (
		<span className="relative block w-full" data-slot="control">
			<RACInput
				{...props}
				className={composeRenderProps(props.className, (className, renderProps) =>
					inputStyles({
						...renderProps,
						className,
					}),
				)}
			/>
		</span>
	);
}

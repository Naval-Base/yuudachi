"use client";

import { AlertCircleIcon } from "lucide-react";
import type { ReactNode } from "react";
import type {
	LabelProps as RACLabelProps,
	TextProps as RACTextProps,
	FieldErrorProps as RACFieldErrorProps,
	InputProps as RACInputProps,
} from "react-aria-components";
import {
	Label as RACLabel,
	Text as RACText,
	FieldError as RACFieldError,
	Input as RACInput,
} from "react-aria-components";
import { cx } from "@/styles/cva";
import { composeTailwindRenderProps } from "@/styles/util";

export function Label(props: RACLabelProps) {
	return (
		<RACLabel
			{...props}
			className={cx(
				"text-base-neutral-800 dark:text-base-neutral-100 group-invalid:text-base-sunset-500 group-disabled:text-base-neutral-900 dark:group-disabled:text-base-neutral-40 text-base-label-md w-fit select-none group-disabled:opacity-38 in-disabled:opacity-38",
				props.className,
			)}
			data-slot="label"
		/>
	);
}

export function Description(props: RACTextProps) {
	return (
		<RACText
			{...props}
			className={cx("text-base-neutral-600 dark:text-base-neutral-300 text-base-sm text-pretty", props.className)}
			slot="description"
		/>
	);
}

export function FieldError(props: RACFieldErrorProps) {
	return (
		<RACFieldError
			{...props}
			className={composeTailwindRenderProps(
				props.className,
				"text-base-sunset-500 text-base-sm flex place-items-center gap-1.5 forced-colors:text-[Mark]",
			)}
		>
			<AlertCircleIcon aria-hidden className="shrink-0" data-slot="icon" size={18} strokeWidth={1.5} />
			{props.children as ReactNode}
		</RACFieldError>
	);
}

export function Input(props: RACInputProps) {
	return (
		<RACInput
			{...props}
			className={composeTailwindRenderProps(
				props.className,
				"text-base-neutral-900 placeholder:text-base-neutral-400 dark:placeholder:text-base-neutral-500 dark:text-base-neutral-40 text-base-lg sm:text-base-md w-full min-w-0 bg-transparent px-3 py-2.5 outline-hidden focus:outline-hidden [&::-ms-reveal]:hidden [&::-webkit-search-cancel-button]:hidden",
			)}
		/>
	);
}

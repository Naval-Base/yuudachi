"use client";

import {
	TimeField as RACTimeField,
	type TimeFieldProps as RACTimeFieldProps,
	type TimeValue as RACTimeValue,
} from "react-aria-components";
import { composeTailwindRenderProps } from "@/styles/util";

export function TimeField<Type extends RACTimeValue>(props: RACTimeFieldProps<Type>) {
	return (
		<RACTimeField
			{...props}
			className={composeTailwindRenderProps(props.className, "group flex w-full flex-col gap-1")}
			data-slot="control"
		/>
	);
}

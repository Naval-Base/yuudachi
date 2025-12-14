"use client";

import type { TextFieldProps as RACTextFieldProps } from "react-aria-components";
import { TextField as RACTextField } from "react-aria-components";
import { composeTailwindRenderProps } from "@/styles/util";

export function TextField(props: RACTextFieldProps) {
	return (
		<RACTextField
			{...props}
			className={composeTailwindRenderProps(props.className, "group flex w-full flex-col gap-1")}
			data-slot="control"
		/>
	);
}

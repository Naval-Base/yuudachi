"use client";

import { ChevronDownIcon, ChevronUpIcon, MinusIcon, PlusIcon } from "lucide-react";
import {
	NumberField as RACNumberField,
	type InputProps,
	type NumberFieldProps as RACNumberFieldProps,
} from "react-aria-components";
import { useMediaQuery } from "usehooks-ts";
import { Button, type ButtonProps } from "@/components/ui/Button";
import { Input, InputGroup } from "@/components/ui/Input";
import { cx } from "@/styles/cva";
import { composeTailwindRenderProps } from "@/styles/util";

export function NumberField(props: RACNumberFieldProps) {
	return (
		<RACNumberField
			{...props}
			className={composeTailwindRenderProps(props.className, "group flex w-full flex-col gap-1")}
			data-slot="control"
		/>
	);
}

export function NumberInput(props: InputProps) {
	const isMobile = useMediaQuery("(max-width: 600px)", { initializeWithValue: false });

	return (
		<InputGroup className={isMobile ? "[--input-gutter-end:--spacing(13)] [--input-gutter-start:--spacing(13)]" : ""}>
			{isMobile && <StepperButton className="top-px! left-px! h-[37.5px] w-10 rounded-l p-px" slot="increment" />}
			<Input {...props} className={cx("tabular-nums", props.className)} />
			{isMobile && <StepperButton className="top-px! right-px! h-[37.5px] w-10 rounded-r p-px" slot="decrement" />}
			{!isMobile && (
				<div
					className="pointer-events-auto right-0 p-px in-disabled:pointer-events-none in-disabled:opacity-38"
					data-slot="text"
				>
					<div className="flex h-full flex-col overflow-hidden rounded-r">
						<StepperButton emblemType="chevron" slot="increment" />
						<StepperButton emblemType="chevron" slot="decrement" />
					</div>
				</div>
			)}
		</InputGroup>
	);
}

type StepperButtonProps = ButtonProps & {
	readonly className?: string;
	readonly emblemType?: "chevron" | "default";
	readonly slot: "decrement" | "increment";
};

function StepperButton({ emblemType = "default", ...props }: StepperButtonProps) {
	const icon =
		emblemType === "chevron" ? (
			props.slot === "increment" ? (
				<ChevronUpIcon aria-hidden size={18} strokeWidth={1.5} />
			) : (
				<ChevronDownIcon aria-hidden size={18} strokeWidth={1.5} />
			)
		) : props.slot === "increment" ? (
			<PlusIcon aria-hidden size={18} strokeWidth={1.5} />
		) : (
			<MinusIcon aria-hidden size={18} strokeWidth={1.5} />
		);

	return (
		<Button
			{...props}
			className={cx(
				"inline-grid size-5 shrink-0 place-content-center p-0",
				"bg-base-neutral-100 dark:bg-base-neutral-700/48",
				"hover:bg-base-neutral-200 dark:hover:bg-base-neutral-700",
				"focus-visible:bg-base-neutral-200 dark:focus-visible:bg-base-neutral-700",
				"pressed:bg-base-neutral-300 dark:pressed:bg-base-neutral-600",
				"disabled:bg-base-neutral-60/32 dark:disabled:bg-base-neutral-700/32",
				props.className,
			)}
			slot={props.slot}
			variant="unset"
		>
			{icon}
		</Button>
	);
}

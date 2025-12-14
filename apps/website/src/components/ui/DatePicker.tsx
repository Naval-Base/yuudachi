"use client";

import type { DateDuration } from "@internationalized/date";
import { CalendarIcon } from "lucide-react";
import { DatePicker as RACDatePicker } from "react-aria-components";
import type {
	DatePickerProps as RACDatePickerProps,
	DateValue as RACDateValue,
	PopoverProps as RACPopoverProps,
	GroupProps as RACGroupProps,
} from "react-aria-components";
import { Button } from "@/components/ui/Button";
import { Calendar } from "@/components/ui/Calendar";
import { DateInput } from "@/components/ui/DateField";
import { InputGroup } from "@/components/ui/Input";
import { PopoverClose, PopoverContent } from "@/components/ui/Popover";
import { cx } from "@/styles/cva";
import { composeTailwindRenderProps } from "@/styles/util";

export type DatePickerOverlayProps = Omit<RACPopoverProps, "children"> & {
	readonly closeButton?: boolean;
	readonly pageBehavior?: "single" | "visible";
	readonly range?: boolean;
	readonly visibleDuration?: DateDuration;
};

export function DatePickerOverlay({
	visibleDuration = { months: 1 },
	closeButton = true,
	pageBehavior = "visible",
	placement = "bottom",
	...props
}: DatePickerOverlayProps) {
	return (
		<PopoverContent
			{...props}
			className={cx("flex min-w-auto snap-x place-content-center rounded-lg")}
			placement={placement}
			showArrow={false}
		>
			{/* {props.range ? <RangeCalendar pageBehavior={pageBehavior} visibleDuration={visibleDuration} /> : <Calendar />} */}
			<Calendar />
			{closeButton && (
				<div className="mx-auto flex w-full max-w-[inherit] place-content-center py-2.5 sm:hidden">
					<PopoverClose className="w-full">Close</PopoverClose>
				</div>
			)}
		</PopoverContent>
	);
}

export type DatePickerProps<Type extends RACDateValue> = RACDatePickerProps<Type> & {
	readonly popover?: Omit<RACPopoverProps, "children">;
};

export function DatePicker<Type extends RACDateValue>({ popover, ...props }: DatePickerProps<Type>) {
	return (
		<RACDatePicker
			{...props}
			className={composeTailwindRenderProps(props.className, "group flex w-full flex-col gap-1")}
			data-slot="control"
		>
			{(values) => (
				<>
					{typeof props.children === "function" ? props.children(values) : props.children}
					<DatePickerOverlay {...popover} />
				</>
			)}
		</RACDatePicker>
	);
}

export function DatePickerTrigger(props: RACGroupProps) {
	return (
		<InputGroup {...props} className={cx("*:data-[slot=control]:w-full", props.className)}>
			<DateInput />
			<Button data-slot="date-picker-trigger" size="icon" variant="unset">
				<CalendarIcon aria-hidden className="size-6 shrink-0 stroke-[1.5]" />
			</Button>
		</InputGroup>
	);
}

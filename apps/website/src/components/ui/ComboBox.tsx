"use client";

import { ChevronDownIcon } from "lucide-react";
import type { ReactNode } from "react";
import type {
	PopoverProps,
	ComboBoxProps as RACComboBoxProps,
	InputProps as RACInputProps,
	ListBoxProps as RACListBoxProps,
} from "react-aria-components";
import {
	ComboBoxContext as RACComboBoxContext,
	ComboBox as RACComboBox,
	useSlottedContext,
} from "react-aria-components";
import { Button } from "@/components/ui/Button";
import { Input, InputGroup } from "@/components/ui/Input";
import { ListBox } from "@/components/ui/ListBox";
import { PopoverContent } from "@/components/ui/Popover";
import { cx } from "@/styles/cva";
import { composeTailwindRenderProps } from "@/styles/util";

export type ComboBoxProps<Type extends object> = Omit<RACComboBoxProps<Type>, "children"> & {
	readonly children: ReactNode;
};

export function ComboBox<Type extends object>(props: ComboBoxProps<Type>) {
	return (
		<RACComboBox
			{...props}
			className={composeTailwindRenderProps(props.className, "group flex w-full flex-col gap-1")}
			data-slot="control"
		/>
	);
}

type ComboBoxListProps<Type extends object> = Omit<RACListBoxProps<Type>, "layout" | "orientation"> &
	Pick<PopoverProps, "placement"> & {
		readonly popover?: Omit<PopoverProps, "children">;
	};

export function ComboBoxList<Type extends object>({ popover, ...props }: ComboBoxListProps<Type>) {
	return (
		<PopoverContent
			{...popover}
			className={cx("min-w-(--trigger-width) scroll-py-1 overflow-y-auto overscroll-contain", popover?.className)}
			placement={popover?.placement ?? "bottom"}
		>
			<ListBox
				{...props}
				className={cx(
					'grid max-h-96 w-full grid-cols-[auto_1fr] flex-col gap-y-1 p-1 outline-hidden *:[[role="group"]+[role=group]]:mt-4 *:[[role="group"]+[role=separator]]:mt-1',
					props.className,
				)}
				layout="stack"
				orientation="vertical"
			>
				{props.children}
			</ListBox>
		</PopoverContent>
	);
}

export function ComboBoxInput(props: RACInputProps) {
	const context = useSlottedContext(RACComboBoxContext);

	return (
		<InputGroup>
			<Input {...props} placeholder={props?.placeholder ?? ""} />
			<Button className="*:data-[slot=icon]:size-6" size="icon" variant="unset">
				{!context?.inputValue && (
					<ChevronDownIcon
						className="transition duration-200 group-open:rotate-180 forced-colors:text-[ButtonText] forced-colors:group-disabled:text-[GrayText]"
						data-slot="icon"
						size={24}
						strokeWidth={1.5}
					/>
				)}
			</Button>
		</InputGroup>
	);
}

export {
	DropdownItem as ComboBoxOption,
	DropdownLabel as ComboBoxLabel,
	DropdownSection as ComboBoxSection,
	DropdownDescription as ComboBoxDescription,
} from "@/components/ui/Dropdown";

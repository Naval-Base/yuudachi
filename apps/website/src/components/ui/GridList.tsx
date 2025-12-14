"use client";

import { MenuIcon } from "lucide-react";
import type { ComponentProps } from "react";
import type {
	GridListItemProps as RACGridListItemProps,
	GridListProps as RACGridListProps,
} from "react-aria-components";
import { GridListItem as RACGridListItem, GridList as RACGridList, composeRenderProps } from "react-aria-components";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { compose, cva, cx } from "@/styles/cva";
import { focusRing } from "@/styles/ui/focusRing";
import { composeTailwindRenderProps } from "@/styles/util";

export function GridList<Type extends object>(props: RACGridListProps<Type>) {
	return (
		<RACGridList
			{...props}
			className={composeTailwindRenderProps(
				props.className,
				"layout-grid:flex layout-grid:flex-wrap relative max-h-none overflow-auto overscroll-contain [scrollbar-width:thin]",
			)}
			data-slot="grid-list"
		>
			{props.children}
		</RACGridList>
	);
}

const itemStyles = compose(
	focusRing,
	cva({
		base: "group relative flex gap-2 p-1 -outline-offset-2 transition select-none focus-visible:outline-2 max-md:flex-1",
		variants: {
			isDisabled: {
				true: "forced-colors:text-[GrayText]",
			},
		},
	}),
);

export type GridListItemProps = RACGridListItemProps & {
	readonly classNames?: { checkbox?: string };
	readonly hasCheckbox?: boolean;
};

export function GridListItem({ hasCheckbox = true, ...props }: GridListItemProps) {
	const textValue = props.textValue ?? (typeof props.children === "string" ? props.children : undefined);

	return (
		<RACGridListItem
			{...props}
			className={composeRenderProps(props.className, (className, renderProps) =>
				itemStyles({ ...renderProps, className }),
			)}
			textValue={textValue!}
		>
			{(values) => (
				<>
					{values.allowsDragging && (
						<Button className="dragging:cursor-grabbing cursor-grab" size="icon-xs" slot="drag" variant="unset">
							<MenuIcon aria-hidden data-slot="icon" size={18} strokeWidth={1.5} />
						</Button>
					)}

					{hasCheckbox && values.selectionMode === "multiple" && values.selectionBehavior === "toggle" && (
						<Checkbox className={cx("place-items-start pt-0.5", props.classNames?.checkbox)} slot="selection" />
					)}
					{typeof props.children === "function" ? props.children(values) : props.children}
				</>
			)}
		</RACGridListItem>
	);
}

export function GridEmptyState(props: ComponentProps<"div">) {
	return <div {...props} className={cx("p-6", props.className)} />;
}

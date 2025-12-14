"use client";

import type {
	PopoverProps as RACPopoverProps,
	DialogTriggerProps as RACDialogTriggerProps,
} from "react-aria-components";
import {
	OverlayArrow as RACOverlayArrow,
	DialogTrigger as RACDialogTrigger,
	Popover as RACPopover,
	composeRenderProps,
} from "react-aria-components";
import type { DialogBodyProps, DialogFooterProps, DialogHeaderProps, DialogTitleProps } from "@/components/ui/Dialog";
import { DialogBody, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { cva, cx } from "@/styles/cva";

export function Popover(props: RACDialogTriggerProps) {
	return <RACDialogTrigger {...props} />;
}

export function PopoverTitle({ level = 2, ...props }: DialogTitleProps) {
	return <DialogTitle {...props} className={cx("sm:leading-none", level === 2 && "sm:text-lg", props.className)} />;
}

export function PopoverHeader(props: DialogHeaderProps) {
	return <DialogHeader {...props} className={cx("sm:p-4", props.className)} />;
}

export function PopoverBody(props: DialogBodyProps) {
	return <DialogBody {...props} className={cx("gap-0 sm:px-4 sm:pt-0", props.className)} />;
}

export function PopoverFooter(props: DialogFooterProps) {
	return <DialogFooter {...props} className={cx("sm:p-4", props.className)} />;
}

const contentStyles = cva({
	base: "group/popover border-base-neutral-200 dark:border-base-neutral-600 shadow-base-sm bg-base-neutral-0 dark:bg-base-neutral-800 text-base-md max-w-xs min-w-(--trigger-width) origin-(--trigger-anchor-point) rounded-sm border transition-transform [scrollbar-width:thin] forced-colors:bg-[Canvas]",
	variants: {
		isEntering: {
			true: "fade-in animate-in placement-left:slide-in-from-right-1 placement-right:slide-in-from-left-1 placement-top:slide-in-from-bottom-1 placement-bottom:slide-in-from-top-1 duration-150 ease-out",
		},
		isExiting: {
			true: "fade-out animate-out placement-left:slide-out-to-right-1 placement-right:slide-out-to-left-1 placement-top:slide-out-to-bottom-1 placement-bottom:slide-out-to-top-1 duration-100 ease-in",
		},
	},
});

export type PopoverContentProps = RACPopoverProps & {
	readonly showArrow?: boolean;
};

export function PopoverContent({ showArrow = true, ...props }: PopoverContentProps) {
	const offset = props.offset ?? (showArrow ? 12 : 8);

	return (
		<RACPopover
			{...props}
			className={composeRenderProps(props.className as string, (className, renderProps) =>
				contentStyles({
					...renderProps,
					className,
				}),
			)}
			offset={offset}
		>
			{(values) => (
				<>
					{showArrow && (
						<RACOverlayArrow className="group">
							<svg
								className="fill-base-neutral-0 dark:fill-base-neutral-800 stroke-base-neutral-200 dark:stroke-base-neutral-600 group-placement-left:-rotate-90 fill-overlay stroke-border group-placement-bottom:rotate-180 group-placement-right:rotate-90 block forced-colors:fill-[Canvas] forced-colors:stroke-[ButtonBorder]"
								height={12}
								viewBox="0 0 12 12"
								width={12}
							>
								<path d="M0 0 L6 6 L12 0" />
							</svg>
						</RACOverlayArrow>
					)}
					{typeof props.children === "function" ? props.children(values) : props.children}
				</>
			)}
		</RACPopover>
	);
}

export {
	DialogTrigger as PopoverTrigger,
	DialogDescription as PopoverDescription,
	DialogClose as PopoverClose,
} from "@/components/ui/Dialog";

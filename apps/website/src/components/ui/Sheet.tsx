"use client";

import type {
	DialogProps as RACDialogProps,
	DialogTriggerProps as RACDialogTriggerProps,
	ModalOverlayProps as RACModalOverlayProps,
} from "react-aria-components";
import {
	DialogTrigger as RACDialogTrigger,
	Modal as RACModal,
	ModalOverlay as RACModalOverlay,
	composeRenderProps,
} from "react-aria-components";
import { Dialog, DialogCloseIndicator } from "@/components/ui/Dialog";
import { cva } from "@/styles/cva";

type Sides = "bottom" | "left" | "right" | "top";
const generateCompoundVariants = (sides: Sides[]) =>
	sides.map((side) => ({
		side,
		isFloat: true,
		className:
			side === "top"
				? "top-2 inset-x-2 border-b-0"
				: side === "bottom"
					? "bottom-2 inset-x-2 border-t-0"
					: side === "left"
						? "left-2 inset-y-2 border-r-0"
						: "right-2 inset-y-2 border-l-0",
	}));

const sheetContentStyles = cva({
	base: "shadow-base-xl bg-base-neutral-0 dark:bg-base-neutral-800 fixed z-50 grid transform-gpu gap-4 rounded-lg text-left align-middle transition ease-in-out will-change-transform",
	variants: {
		isEntering: {
			true: "animate-in duration-300",
		},
		isExiting: {
			true: "animate-out duration-200",
		},
		side: {
			top: "entering:slide-in-from-top exiting:slide-out-to-top inset-x-0 top-0 border-b",
			bottom: "entering:slide-in-from-bottom exiting:slide-out-to-bottom inset-x-0 bottom-0 border-t",
			left: "entering:slide-in-from-left exiting:slide-out-to-left inset-y-0 left-0 h-auto w-full max-w-xs overflow-y-auto border-r",
			right:
				"entering:slide-in-from-right exiting:slide-out-to-right border-base-neutral-200 dark:border-base-neutral-600 inset-y-0 right-0 h-auto w-full max-w-xs overflow-y-auto border-l",
		},
		isFloat: {
			true: null,
			false: null,
		},
	},
	compoundVariants: generateCompoundVariants(["top", "bottom", "left", "right"]),
});

export type SheetProps = RACDialogTriggerProps;

export function Sheet(props: SheetProps) {
	return <RACDialogTrigger {...props} />;
}

const sheetOverlayStyles = cva({
	base: "bg-base-neutral-900/72 fixed top-0 left-0 isolate z-50 flex h-(--visual-viewport-height) w-dvw place-content-end place-items-end p-4",
	variants: {
		isBlurred: {
			true: "supports-backdrop-filter:backdrop-blur",
		},
		isEntering: {
			true: "fade-in animate-in duration-300 ease-out",
		},
		isExiting: {
			true: "fade-out animate-out duration-200 ease-in",
		},
	},
});

export type SheetContentProps = Pick<RACDialogProps, "aria-label" | "aria-labelledby" | "role"> &
	RACModalOverlayProps & {
		readonly closeButton?: boolean;
		readonly isBlurred?: boolean;
		readonly isFloat?: boolean;
		readonly overlay?: Omit<RACModalOverlayProps, "children">;
		readonly side?: Sides;
	};

export function SheetContent({
	isBlurred = false,
	isDismissable: isDismissableInternal,
	side = "right",
	role = "dialog",
	closeButton = true,
	isFloat = true,
	overlay,
	...props
}: SheetContentProps) {
	const isDismissable = isDismissableInternal ?? role !== "alertdialog";

	return (
		<RACModalOverlay
			{...props}
			className={composeRenderProps("", (className, renderProps) =>
				sheetOverlayStyles({
					...renderProps,
					isBlurred,
					className,
				}),
			)}
			isDismissable={isDismissable}
		>
			<RACModal
				className={composeRenderProps(props.className, (className, renderProps) =>
					sheetContentStyles({
						...renderProps,
						side,
						isFloat,
						className,
					}),
				)}
			>
				{(values) => (
					<Dialog aria-label={props["aria-label"]!} role={role}>
						<>
							{typeof props.children === "function" ? props.children(values) : props.children}
							{closeButton && <DialogCloseIndicator className="top-2.5 right-2.5" isDismissable={isDismissable} />}
						</>
					</Dialog>
				)}
			</RACModal>
		</RACModalOverlay>
	);
}

export {
	DialogTrigger as SheetTrigger,
	DialogBody as SheetBody,
	DialogClose as SheetClose,
	DialogDescription as SheetDescription,
	DialogFooter as SheetFooter,
	DialogHeader as SheetHeader,
	DialogTitle as SheetTitle,
} from "@/components/ui/Dialog";

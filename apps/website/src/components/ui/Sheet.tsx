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
	base: "fixed z-50 grid transform-gpu gap-4 rounded-lg bg-base-neutral-0 text-left align-middle shadow-base-xl transition ease-in-out will-change-transform dark:bg-base-neutral-800",
	variants: {
		isEntering: {
			true: "animate-in duration-300",
		},
		isExiting: {
			true: "animate-out duration-200",
		},
		side: {
			top: "inset-x-0 top-0 border-b entering:slide-in-from-top exiting:slide-out-to-top",
			bottom: "inset-x-0 bottom-0 border-t entering:slide-in-from-bottom exiting:slide-out-to-bottom",
			left: "inset-y-0 left-0 h-auto w-full max-w-xs overflow-y-auto border-r entering:slide-in-from-left exiting:slide-out-to-left",
			right:
				"inset-y-0 right-0 h-auto w-full max-w-xs overflow-y-auto border-l border-base-neutral-200 dark:border-base-neutral-600 entering:slide-in-from-right exiting:slide-out-to-right",
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
	base: "fixed top-0 left-0 isolate z-50 flex h-(--visual-viewport-height) w-dvw place-content-end place-items-end bg-base-neutral-900/72 p-4",
	variants: {
		isBlurred: {
			true: "supports-backdrop-filter:backdrop-blur",
		},
		isEntering: {
			true: "animate-in duration-300 ease-out fade-in",
		},
		isExiting: {
			true: "animate-out duration-200 ease-in fade-out",
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

"use client";

import { MenuIcon, SidebarIcon, XIcon } from "lucide-react";
import {
	createContext,
	use,
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useState,
	type ComponentProps,
	type ReactNode,
} from "react";
import { chain } from "react-aria";
import {
	composeRenderProps,
	Link,
	Header as RACHeader,
	type LinkProps,
	type LinkRenderProps,
} from "react-aria-components";
import { useMediaQuery } from "usehooks-ts";
import { Button, type ButtonProps } from "@/components/ui/Button";
import { SheetBody, SheetContent, type SheetContentProps } from "@/components/ui/Sheet";
import { Tooltip, TooltipContent } from "@/components/ui/Tooltip";
import { cva, cx } from "@/styles/cva";

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

type SidebarContextProps = {
	isMobile: boolean;
	open: boolean;
	openMobile: boolean;
	setOpen(open: boolean | ((open: boolean) => boolean)): void;
	setOpenMobile(open: boolean | ((open: boolean) => boolean)): void;
	state: "collapsed" | "expanded";
};

const SidebarContext = createContext<SidebarContextProps | null>(null);

export function useSidebar() {
	const context = use(SidebarContext);
	if (!context) {
		throw new Error("useSidebar must be used within a Sidebar.");
	}

	return context;
}

export type SidebarProviderProps = ComponentProps<"div"> & {
	readonly defaultOpen?: boolean;
	readonly isOpen?: boolean;
	onOpenChange?(open: boolean): void;
	readonly shortcut?: string;
};

export function SidebarProvider({
	defaultOpen = false,
	isOpen: openProp,
	onOpenChange: setOpenProp,
	shortcut = "b",
	...props
}: SidebarProviderProps) {
	const isMobile = useMediaQuery("(max-width: 767px)", { initializeWithValue: false });
	const [openMobile, setOpenMobile] = useState(false);

	const [internalOpenState, setInternalOpenState] = useState(defaultOpen);
	const open = openProp ?? internalOpenState;
	const setOpen = useCallback(
		(value: boolean | ((value: boolean) => boolean)) => {
			const openState = typeof value === "function" ? value(open) : value;

			if (setOpenProp) {
				setOpenProp(openState);
				if (isMobile) {
					setOpenMobile(openState);
				}
			} else {
				setInternalOpenState(openState);
			}

			// eslint-disable-next-line react-compiler/react-compiler
			document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
		},
		[setOpenProp, open, isMobile, setOpenMobile],
	);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === shortcut && (event.metaKey || event.ctrlKey)) {
				event.preventDefault();
				setOpen((open) => !open);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [shortcut, setOpen]);

	const state = open ? "expanded" : "collapsed";

	const contextValue = useMemo<SidebarContextProps>(
		() => ({
			state,
			open,
			setOpen,
			openMobile,
			setOpenMobile,
			isMobile,
		}),
		[state, open, setOpen, openMobile, setOpenMobile, isMobile],
	);

	return (
		<SidebarContext value={contextValue}>
			<div
				{...props}
				className={cx(
					"@container/sidebar **:data-[slot=icon]:shrink-0",
					"[--sidebar-width-dock:3.25rem] [--sidebar-width:24.25rem]",
					"[--sidebar-border:var(--color-base-neutral-200)]",
					"dark:[--sidebar-border:var(--color-base-neutral-600)]",
					"flex min-h-dvh w-full",
					"group/sidebar-root has-data-[sidebar-intent=inset]:bg-base-neutral-0 dark:has-data-[sidebar-intent=inset]:bg-base-neutral-800",
					"[@-moz-document_url-prefix()]:overflow-x-hidden",
					props.className,
				)}
			>
				{props.children}
			</div>
		</SidebarContext>
	);
}

const sidebarGapStyles = cva({
	base: [
		"w-(--sidebar-width) group-data-[sidebar-collapsible=hidden]/sidebar-container:w-0",
		"relative h-dvh bg-transparent transition-[width] duration-100 ease-linear",
		"group-data-[sidebar-side=right]/sidebar-container:rotate-180",
	],
	variants: {
		intent: {
			default: "group-data-[sidebar-collapsible=dock]/sidebar-container:w-(--sidebar-width-dock)",
			fleet: "group-data-[sidebar-collapsible=dock]/sidebar-container:w-(--sidebar-width-dock)",
			float:
				"group-data-[sidebar-collapsible=dock]/sidebar-container:w-[calc(var(--sidebar-width-dock)+theme(spacing.4))]",
			inset:
				"group-data-[sidebar-collapsible=dock]/sidebar-container:w-[calc(var(--sidebar-width-dock)+theme(spacing.2))]",
		},
	},
});

const sidebarStyles = cva({
	base: [
		"fixed inset-y-0 z-10 hidden h-dvh w-(--sidebar-width) transition-[left,right,width] duration-100 ease-linear md:flex",
		"bg-base-neutral-0 dark:bg-base-neutral-800 min-h-dvh",
		"**:data-[slot=disclosure]:border-0 **:data-[slot=disclosure]:px-2.5",
		"has-data-[sidebar-intent=default]:shadow-base-md",
		"[@-moz-document_url-prefix()]:h-full [@-moz-document_url-prefix()]:min-h-full",
	],
	variants: {
		side: {
			left: "left-0 group-data-[sidebar-collapsible=hidden]/sidebar-container:left-[calc(var(--sidebar-width)*-1)]",
			right: "right-0 group-data-[sidebar-collapsible=hidden]/sidebar-container:right-[calc(var(--sidebar-width)*-1)]",
		},
		intent: {
			default: [
				"group-data-[sidebar-collapsible=dock]/sidebar-container:w-(--sidebar-width-dock) group-data-[sidebar-side=left]/sidebar-container:border-(--sidebar-border) group-data-[sidebar-side=right]/sidebar-container:border-(--sidebar-border)",
				"group-data-[sidebar-side=left]/sidebar-container:border-r group-data-[sidebar-side=right]/sidebar-container:border-l",
			],
			fleet: [
				"group-data-[sidebar-collapsible=dock]/sidebar-container:w-(--sidebar-width-dock)",
				"**:data-sidebar-disclosure:gap-y-0 **:data-sidebar-disclosure:px-0 **:data-sidebar-section:gap-y-0 **:data-sidebar-section:px-0",
				"group-data-[sidebar-side=left]/sidebar-container:border-r group-data-[sidebar-side=right]/sidebar-container:border-l",
			],
			float: "bg-bg p-2 group-data-[sidebar-collapsible=dock]/sidebar-container:w-[calc(var+theme(spacing.4)+2px)]",
			inset: [
				"p-2 group-data-[sidebar-collapsible=dock]/sidebar-container:w-[calc(var(--sidebar-width-dock)+theme(spacing.2)+2px)]",
			],
		},
	},
});

export type SidebarProps = ComponentProps<"div"> &
	SheetContentProps & {
		readonly closeButton?: boolean;
		readonly collapsible?: "dock" | "hidden" | "none";
		readonly intent?: "default" | "fleet" | "float" | "inset";
		readonly side?: "left" | "right";
	};

export function Sidebar({
	closeButton = true,
	collapsible = "hidden",
	side = "left",
	intent = "default",
	...props
}: SidebarProps) {
	const { isMobile, state, open, setOpen } = useSidebar();
	const [needsScrollbarGutter, setNeedsScrollbarGutter] = useState(false);

	useLayoutEffect(() => {
		if (collapsible === "none" || isMobile || side !== "right") {
			return;
		}

		const scrollbarVisible = (element: HTMLElement) => element.scrollHeight > element.clientHeight;

		const observer = new MutationObserver((mutations) => {
			if (mutations[0]?.type === "attributes" && scrollbarVisible(document.documentElement) && open) {
				if (getComputedStyle(document.documentElement).paddingRight === "0px") {
					setNeedsScrollbarGutter(false);
				} else {
					setNeedsScrollbarGutter(true);
				}
			} else {
				setNeedsScrollbarGutter(false);
			}
		});

		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["style"],
		});

		return () => {
			observer.disconnect();
		};
	}, [collapsible, isMobile, open, side]);

	if (collapsible === "none") {
		return (
			<div
				{...props}
				className={cx("flex h-full w-(--sidebar-width) flex-col border-r border-(--sidebar-border)", props.className)}
				data-sidebar-collapsible="none"
				data-sidebar-intent={intent}
			/>
		);
	}

	if (isMobile) {
		return (
			<SheetContent
				{...props}
				aria-label="Sidebar"
				closeButton={closeButton}
				data-sidebar-intent="default"
				isFloat={intent === "float"}
				isOpen={open}
				onOpenChange={setOpen}
				side={side}
			>
				<SheetBody className="gap-0 p-0">{props.children}</SheetBody>
			</SheetContent>
		);
	}

	return (
		<div
			{...props}
			className="group/sidebar-container peer hidden md:block"
			data-sidebar-collapsible={state === "collapsed" ? collapsible : ""}
			data-sidebar-intent={intent}
			data-sidebar-side={side}
			data-sidebar-state={state}
		>
			<div aria-hidden className={sidebarGapStyles({ intent })} />
			<div
				{...props}
				className={sidebarStyles({
					side,
					intent,
					className: cx(props.className, needsScrollbarGutter && "right-[11px]", "transition-[left,width]"),
				})}
			>
				<div
					className={cx(
						"flex h-full w-full flex-col",
						"group-data-[sidebar-intent=inset]/sidebar-container:bg-sidebar dark:group-data-[sidebar-intent=inset]/sidebar-container:bg-bg",
						"group-data-[sidebar-intent=float]/sidebar-container:bg-sidebar group-data-[sidebar-intent=float]/sidebar-container:shadow-base-md group-data-[sidebar-intent=float]/sidebar-container:rounded-lg group-data-[sidebar-intent=float]/sidebar-container:border group-data-[sidebar-intent=float]/sidebar-container:border-(--sidebar-border)",
					)}
					data-sidebar="default"
				>
					{props.children}
				</div>
			</div>
		</div>
	);
}

export function SidebarInsetAnchor({
	collapsible = "hidden",
	side = "left",
	intent = "default",
	...props
}: SidebarProps) {
	const { state } = useSidebar();

	return (
		<div
			{...props}
			className="group/sidebar-container peer hidden"
			data-sidebar-collapsible={state === "collapsed" ? collapsible : ""}
			data-sidebar-intent={intent}
			data-sidebar-side={side}
			data-sidebar-state={state}
		/>
	);
}

const sidebarHeaderStyles = cva({
	base: "dark:bg-base-neutral-800 bg-base-neutral-0 flex flex-col **:data-[slot=sidebar-label-mask]:hidden",
	variants: {
		collapsed: {
			true: "mt-2 p-12 group-data-[sidebar-intent=float]/sidebar-container:mt-2 md:mx-auto md:size-9 md:items-center md:justify-center md:rounded-lg md:p-0 md:hover:bg-(--sidebar-accent)",
			false: "px-6 pt-8 pb-4",
		},
		hasBorder: {
			true: "border-base-neutral-100 dark:border-base-neutral-700 border-b",
			false: null,
		},
	},
});

export type SidebarHeaderProps = ComponentProps<"div"> & {
	readonly hasBorder?: boolean;
};

export function SidebarHeader({ hasBorder = false, ...props }: SidebarHeaderProps) {
	const { state } = use(SidebarContext)!;

	return (
		<div
			{...props}
			className={sidebarHeaderStyles({ collapsed: state === "collapsed", hasBorder, className: props.className })}
			data-sidebar-header="true"
		/>
	);
}

const sidebarFooterStyles = cva({
	base: [
		"flex flex-col p-6",
		"in-data-[sidebar-intent=fleet]:mt-0 in-data-[sidebar-intent=fleet]:p-0",
		"in-data-[sidebar-intent=fleet]:**:data-[slot=menu-trigger]:rounded-none",
		"**:data-[slot=menu-trigger]:relative **:data-[slot=menu-trigger]:overflow-hidden",
		"**:data-[slot=menu-trigger]:rounded-lg",
		"sm:**:data-[slot=menu-trigger]:text-base-md **:data-[slot=menu-trigger]:flex **:data-[slot=menu-trigger]:cursor-default **:data-[slot=menu-trigger]:items-center **:data-[slot=menu-trigger]:p-2 **:data-[slot=menu-trigger]:outline-hidden",
		"**:data-[slot=menu-trigger]:hover:text-fg **:data-[slot=menu-trigger]:hover:bg-(--sidebar-accent)",
	],
	variants: {
		collapsed: {
			true: [
				"**:data-[slot=avatar]:size-6 **:data-[slot=avatar]:*:size-6",
				"**:data-[slot=chevron]:hidden **:data-[slot=menu-label]:hidden",
				"**:data-[slot=menu-trigger]:grid **:data-[slot=menu-trigger]:size-8 **:data-[slot=menu-trigger]:place-content-center",
			],
			false: [
				"**:data-[slot=avatar]:size-8 **:data-[slot=avatar]:*:size-8 **:data-[slot=menu-trigger]:**:data-[slot=avatar]:mr-2",
				"**:data-[slot=menu-trigger]:pressed:**:data-[slot=chevron]:rotate-180 **:data-[slot=menu-trigger]:w-full **:data-[slot=menu-trigger]:**:data-[slot=chevron]:ml-auto **:data-[slot=menu-trigger]:**:data-[slot=chevron]:transition-transform",
			],
		},
		hasBorder: {
			true: "border-base-neutral-100 dark:border-base-neutral-700 border-t",
			false: null,
		},
	},
});

export type SidebarFooterProps = ComponentProps<"div"> & {
	readonly hasBorder?: boolean;
};

export function SidebarFooter({ hasBorder = false, ...props }: SidebarFooterProps) {
	const { state, isMobile } = useSidebar();
	const collapsed = state === "collapsed" && !isMobile;

	return (
		<div
			{...props}
			className={sidebarFooterStyles({ collapsed, hasBorder, className: props.className })}
			data-sidebar-footer="true"
		/>
	);
}

export function SidebarContent(props: ComponentProps<"div">) {
	const { state } = useSidebar();

	return (
		<div
			{...props}
			className={cx(
				"dark:bg-base-neutral-800 bg-base-neutral-0 flex min-h-0 flex-1 scroll-mb-96 flex-col overflow-auto p-6 *:data-sidebar-section:border-l-0",
				state === "collapsed" && "place-items-center",
				props.className,
			)}
			data-sidebar-content="true"
		/>
	);
}

export function SidebarSectionGroup(props: ComponentProps<"section">) {
	const { state, isMobile } = useSidebar();
	const collapsed = state === "collapsed" && !isMobile;

	return (
		<section
			{...props}
			className={cx(
				"flex w-full flex-col gap-y-6",
				collapsed && "place-content-center place-items-center",
				props.className,
			)}
			data-sidebar-section-group="true"
		/>
	);
}

type SidebarSectionProps = React.ComponentProps<"div"> & {
	readonly label?: string;
};

export function SidebarSection({ className, ...props }: SidebarSectionProps) {
	const { state } = useSidebar();

	return (
		<div
			className={cx(
				"col-span-full flex flex-col gap-0.5 **:data-sidebar-section:**:gap-0 **:data-sidebar-section:pr-0",
				state === "expanded" && "px-2.5",
				className,
			)}
			data-sidebar-section="true"
			{...props}
		>
			{state !== "collapsed" && "label" in props && (
				<RACHeader className="mb-1 flex shrink-0 items-center rounded-md px-2.5 transition-[margin,opacity] duration-200 ease-linear outline-none group-data-[sidebar-collapsible=dock]/sidebar-container:-mt-8 group-data-[sidebar-collapsible=dock]/sidebar-container:opacity-0 focus-visible:ring-2 *:data-[slot=icon]:size-4 *:data-[slot=icon]:shrink-0">
					{props.label}
				</RACHeader>
			)}
			<div className="grid grid-cols-[auto_1fr] gap-0.5">{props.children}</div>
		</div>
	);
}

const sidebarItemStyles = cva({
	base: [
		"group/sidebar-item text-sidebar-fg/70 relative col-span-full cursor-pointer overflow-hidden rounded-lg px-[calc(var(--spacing)*2.3)] py-[calc(var(--spacing)*1.3)] focus-visible:outline-hidden sm:text-sm/6",
		"**:data-[slot=menu-trigger]:pressed:opacity-100 pressed:**:data-[slot=menu-trigger]:opacity-100 **:data-[slot=menu-trigger]:absolute **:data-[slot=menu-trigger]:right-0 **:data-[slot=menu-trigger]:-mr-1 **:data-[slot=menu-trigger]:flex **:data-[slot=menu-trigger]:h-full **:data-[slot=menu-trigger]:w-[calc(var(--sidebar-width)-90%)] **:data-[slot=menu-trigger]:items-center **:data-[slot=menu-trigger]:justify-end **:data-[slot=menu-trigger]:pr-2.5 **:data-[slot=menu-trigger]:opacity-0 hover:**:data-[slot=menu-trigger]:opacity-100 **:data-[slot=menu-trigger]:focus-visible:opacity-100 **:data-[slot=menu-trigger]:has-data-focus:opacity-100",
		"**:data-[slot=avatar]:size-4 **:data-[slot=avatar]:shrink-0 **:data-[slot=avatar]:*:size-4 **:data-[slot=icon]:size-4 **:data-[slot=icon]:shrink-0",
		"in-data-[sidebar-intent=fleet]:rounded-none",
	],
	variants: {
		collapsed: {
			true: "flex size-9 place-content-center place-items-center gap-x-0 p-0 not-has-data-[slot=icon]:hidden **:data-[slot=menu-trigger]:hidden",
			false:
				"grid grid-cols-[auto_1fr_1.5rem_0.5rem_auto] place-items-center **:data-[slot=avatar]:mr-2 **:data-[slot=avatar]:*:mr-2 **:data-[slot=icon]:mr-2 supports-[grid-template-columns:subgrid]:grid-cols-subgrid",
		},
		isCurrent: {
			true: "text-fg hover:text-fg **:data-[slot=icon]:text-fg [&_.text-muted-fg]:text-fg/80 bg-(--sidebar-accent) hover:bg-(--sidebar-accent)/90 **:data-[slot=menu-trigger]:from-(--sidebar-accent)",
			false: null,
		},
		isActive: {
			true: "text-sidebar-fg bg-(--sidebar-accent) **:data-[slot=menu-trigger]:flex",
			false: null,
		},
		isDisabled: {
			true: "cursor-default opacity-50",
			false: null,
		},
	},
});

type SidebarItemProps = Omit<ComponentProps<typeof Link>, "children"> & {
	readonly children?:
		| ReactNode
		| ((values: LinkRenderProps & { defaultChildren: ReactNode; isCollapsed: boolean }) => ReactNode);
	readonly isCurrent?: boolean;
	readonly tooltip?: ReactNode | string;
};

export function SidebarItem(props: SidebarItemProps) {
	const { state, isMobile } = useSidebar();
	const isCollapsed = state === "collapsed" && !isMobile;

	const link = (
		<Link
			{...props}
			aria-current={props.isCurrent ? "page" : undefined}
			className={composeRenderProps(props.className, (className, renderProps) =>
				sidebarItemStyles({
					...renderProps,
					isCurrent: props.isCurrent,
					collapsed: isCollapsed,
					isActive: renderProps.isPressed || renderProps.isFocusVisible || renderProps.isHovered,
					className,
				}),
			)}
			data-sidebar-item="true"
		>
			{(values) => (
				<>{typeof props.children === "function" ? props.children({ ...values, isCollapsed }) : props.children}</>
			)}
		</Link>
	);

	return isCollapsed && props.tooltip ? (
		<Tooltip delay={0}>
			{link}
			<TooltipContent
				className="**:data-[slot=icon]:hidden **:data-[slot=sidebar-label-mask]:hidden"
				placement="right"
				showArrow={false}
			>
				{props.tooltip}
			</TooltipContent>
		</Tooltip>
	) : (
		link
	);
}

const sidebarLinkStyles = cva({
	base: "col-span-full items-center focus:outline-hidden",
	variants: {
		collapsed: {
			true: "absolute inset-0 flex size-full place-content-center",
			false: "grid grid-cols-[auto_1fr_1.5rem_0.5rem_auto] supports-[grid-template-columns:subgrid]:grid-cols-subgrid",
		},
	},
});

export function SidebarLink({ className, ...props }: LinkProps) {
	const { state, isMobile } = useSidebar();
	const collapsed = state === "collapsed" && !isMobile;

	return (
		<Link
			{...props}
			className={composeRenderProps(className, (className, renderProps) =>
				sidebarLinkStyles({
					...renderProps,
					collapsed,
					className,
				}),
			)}
		/>
	);
}

export function SidebarInset(props: ComponentProps<"main">) {
	return (
		<main
			{...props}
			className={cx(
				"flex min-h-dvh w-full flex-1 flex-col peer-data-[sidebar-intent=inset]:border peer-data-[sidebar-intent=inset]:border-transparent",
				"bg-bg dark:peer-data-[sidebar-intent=inset]:bg-sidebar peer-data-[sidebar-intent=inset]:overflow-hidden",
				"md:peer-data-[sidebar-intent=inset]:shadow-base-md peer-data-[sidebar-intent=inset]:min-h-[calc(100dvh-theme(spacing.4))] md:peer-data-[sidebar-intent=inset]:m-2 md:peer-data-[sidebar-intent=inset]:rounded-xl md:peer-data-[sidebar-intent=inset]:peer-data-[sidebar-side=left]:ml-0 md:peer-data-[sidebar-intent=inset]:peer-data-[sidebar-side=right]:mr-0 md:peer-data-[sidebar-state=collapsed]:peer-data-[sidebar-intent=inset]:peer-data-[sidebar-side=left]:ml-2 md:peer-data-[sidebar-state=collapsed]:peer-data-[sidebar-intent=inset]:peer-data-[sidebar-side=right]:mr-2",
				props.className,
			)}
		/>
	);
}

export function SidebarTrigger({ onPress, children, ...props }: ButtonProps) {
	const { setOpen } = useSidebar();

	return (
		<Button
			{...props}
			// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
			aria-label={props["aria-label"] || "Toggle Sidebar"}
			data-sidebar-trigger="true"
			onPress={(event) => {
				onPress?.(event);
				setOpen((open) => !open);
			}}
			size="icon-xs"
		>
			{children || (
				<>
					<SidebarIcon aria-hidden className="hidden md:inline" data-slot="icon" size={18} />
					<MenuIcon aria-hidden className="inline md:hidden" data-slot="icon" size={18} />
					<span className="sr-only">Toggle Sidebar</span>
				</>
			)}
		</Button>
	);
}

export type CloseButtonIndicatorProps = Omit<ButtonProps, "children"> & {
	readonly className?: string;
	readonly isDismissable?: boolean | undefined;
};

export function SidebarCloseIndicator({ isDismissable = true, ...props }: CloseButtonIndicatorProps) {
	const { setOpen } = useSidebar();

	return (
		<Button
			{...props}
			aria-label="Close"
			className={cx(
				"close text-base-neutral-500 hover:text-base-neutral-700 focus-visible:text-base-neutral-700 pressed:text-base-neutral-900 dark:text-base-neutral-400 dark:hover:text-base-neutral-200 dark:focus-visible:text-base-neutral-200 dark:pressed:text-base-neutral-500 disabled:text-base-neutral-300 dark:disabled:text-base-neutral-300 z-50 rounded-full",
				props.className,
			)}
			onPress={isDismissable ? chain(() => setOpen((open) => !open), props.onPress) : props.onPress!}
			size="icon-xs"
			slot={props.slot === null ? null : (props.slot ?? "close")}
			variant="unset"
		>
			<XIcon aria-hidden className="size-4.5 stroke-[1.5]" />
		</Button>
	);
}

export function SidebarRail({ className, ref, ...props }: ComponentProps<"button">) {
	const { setOpen } = useSidebar();

	return (
		<button
			aria-label="Toggle Sidebar"
			className={cx(
				"absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 outline-hidden transition-all ease-linear group-data-[sidebar-side=left]/sidebar-container:-right-4 group-data-[sidebar-side=right]/sidebar-container:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] data-hovered:after:bg-transparent sm:flex",
				"in-data-[sidebar-side=left]:cursor-w-resize in-data-[sidebar-side=right]:cursor-e-resize",
				"[[data-sidebar-side=left][data-sidebar-state=collapsed]_&]:cursor-e-resize [[data-sidebar-side=right][data-sidebar-state=collapsed]_&]:cursor-w-resize",
				"group-data-[sidebar-collapsible=hidden]/sidebar-container:hover:bg-secondary group-data-[sidebar-collapsible=hidden]/sidebar-container:translate-x-0 group-data-[sidebar-collapsible=hidden]/sidebar-container:after:left-full",
				"[[data-sidebar-side=left][data-sidebar-collapsible=hidden]_&]:-right-2 [[data-sidebar-side=right][data-sidebar-collapsible=hidden]_&]:-left-2",
				className,
			)}
			data-sidebar="rail"
			onClick={() => setOpen((open) => !open)}
			ref={ref}
			tabIndex={-1}
			title="Toggle Sidebar"
			type="button"
			{...props}
		/>
	);
}

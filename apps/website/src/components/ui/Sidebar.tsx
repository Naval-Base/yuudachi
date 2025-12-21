"use client";

import { ChevronDownIcon, MenuIcon, SidebarIcon, XIcon } from "lucide-react";
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
	Button as RACButton,
	Disclosure as RACDisclosure,
	DisclosureGroup as RACDisclosureGroup,
	DisclosurePanel as RACDisclosurePanel,
	DisclosureStateContext as RACDisclosureStateContext,
	Heading as RACHeading,
	Link,
	Separator as RACSeparator,
	Text as RACText,
	Header as RACHeader,
	type ButtonProps as RACButtonProps,
	type DisclosureGroupProps as RACDisclosureGroupProps,
	type DisclosurePanelProps as RACDisclosurePanelProps,
	type DisclosureProps as RACDisclosureProps,
	type LinkProps,
	type LinkRenderProps,
	type SeparatorProps as RACSeparatorProps,
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
	isOpenOnMobile: boolean;
	open: boolean;
	setIsOpenOnMobile(open: boolean | ((open: boolean) => boolean)): void;
	setOpen(open: boolean | ((open: boolean) => boolean)): void;
	state: "collapsed" | "expanded";
};

const SidebarContext = createContext<SidebarContextProps | null>(null);

export function useSidebar() {
	const context = use(SidebarContext);
	if (!context) {
		throw new Error("useSidebar must be used within a SidebarProvider.");
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
			isOpenOnMobile: openMobile,
			setIsOpenOnMobile: setOpenMobile,
			isMobile: isMobile ?? false,
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
					"group/sidebar-root peer/sidebar-root has-data-[intent=inset]:bg-base-neutral-100 dark:has-data-[intent=inset]:bg-base-neutral-800",
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
		"w-(--sidebar-width) group-data-[collapsible=hidden]:w-0",
		"relative h-dvh bg-transparent transition-[width] duration-100 ease-linear",
		"group-data-[side=right]:rotate-180",
	],
	variants: {
		intent: {
			default: "group-data-[collapsible=dock]:w-(--sidebar-width-dock)",
			fleet: "group-data-[collapsible=dock]:w-(--sidebar-width-dock)",
			float: "group-data-[collapsible=dock]:w-[calc(var(--sidebar-width-dock)+theme(spacing.4))]",
			inset: "group-data-[collapsible=dock]:w-[calc(var(--sidebar-width-dock)+theme(spacing.2))]",
		},
	},
});

const sidebarStyles = cva({
	base: [
		"fixed inset-y-0 z-10 hidden h-dvh w-(--sidebar-width) transition-[left,right,width] duration-100 ease-linear md:flex",
		"in-data-[intent=inset]:bg-base-neutral-100 bg-base-neutral-0 dark:bg-base-neutral-800 min-h-dvh",
		"**:data-[slot=disclosure]:border-0 **:data-[slot=disclosure]:px-2.5",
		"group-data-[intent=default]:shadow-base-md not-has-data-[slot=sidebar-footer]:pb-2",
		"[@-moz-document_url-prefix()]:h-full [@-moz-document_url-prefix()]:min-h-full",
	],
	variants: {
		side: {
			left: "left-0 group-data-[collapsible=hidden]:left-[calc(var(--sidebar-width)*-1)]",
			right: "right-0 group-data-[collapsible=hidden]:right-[calc(var(--sidebar-width)*-1)]",
		},
		intent: {
			default: [
				"group-data-[collapsible=dock]:w-(--sidebar-width-dock) group-data-[side=left]:border-(--sidebar-border) group-data-[side=right]:border-(--sidebar-border)",
				"group-data-[side=left]:border-r group-data-[side=right]:border-l",
			],
			fleet: [
				"group-data-[collapsible=dock]:w-(--sidebar-width-dock)",
				"**:data-sidebar-disclosure:gap-y-0 **:data-sidebar-disclosure:px-0 **:data-sidebar-section:gap-y-0 **:data-sidebar-section:px-0",
				"group-data-[side=left]:border-r group-data-[side=right]:border-l",
			],
			float: "bg-bg p-2 group-data-[collapsible=dock]:w-[calc(var(--sidebar-width-dock)+theme(spacing.4)+2px)]",
			inset: ["p-2 group-data-[collapsible=dock]:w-[calc(var(--sidebar-width-dock)+theme(spacing.2)+2px)]"],
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
				data-collapsible="none"
				data-intent={intent}
				data-slot="sidebar"
			/>
		);
	}

	if (isMobile) {
		return (
			<>
				<span aria-hidden className="sr-only" data-intent={intent} />
				<SheetContent
					{...props}
					aria-label="Sidebar"
					className={cx(
						"entering:blur-in exiting:blur-out w-(--sidebar-width) [--sidebar-width:18rem] has-data-[slot=calendar]:[--sidebar-width:23rem]",
						props.className,
					)}
					closeButton={closeButton}
					data-intent="default"
					data-slot="sidebar"
					isFloat={intent === "float"}
					isOpen={open}
					onOpenChange={setOpen}
					side={side}
				>
					<SheetBody className="gap-0 p-0">{props.children}</SheetBody>
				</SheetContent>
			</>
		);
	}

	return (
		<div
			{...props}
			className="group peer hidden md:block"
			data-collapsible={state === "collapsed" ? collapsible : ""}
			data-intent={intent}
			data-side={side}
			data-slot="sidebar"
			data-state={state}
		>
			<div aria-hidden className={sidebarGapStyles({ intent })} data-slot="sidebar-gap" />
			<div
				{...props}
				className={sidebarStyles({
					side,
					intent,
					className: cx(props.className, "transition-[left,width]", needsScrollbarGutter && "right-[11px]"),
				})}
				data-slot="sidebar-container"
			>
				<div
					className={cx(
						"flex h-full w-full flex-col",
						"group-data-[intent=inset]:bg-base-neutral-100 dark:group-data-[intent=inset]:bg-base-neutral-800",
						"group-data-[intent=float]:bg-sidebar group-data-[intent=float]:shadow-base-md group-data-[intent=float]:rounded-lg group-data-[intent=float]:border group-data-[intent=float]:border-(--sidebar-border)",
					)}
					data-sidebar="default"
					data-slot="sidebar-inner"
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
			className="group peer hidden"
			data-collapsible={state === "collapsed" ? collapsible : ""}
			data-intent={intent}
			data-side={side}
			data-state={state}
		/>
	);
}

const sidebarHeaderStyles = cva({
	base: "dark:bg-base-neutral-800 in-data-[intent=inset]:bg-base-neutral-100 dark:in-data-[intent=inset]:dark:bg-base-neutral-800 bg-base-neutral-0 flex flex-col in-data-[intent=inset]:p-4",
	variants: {
		collapsed: {
			true: "px-2.5 pt-8 pb-4 gap-2 place-items-center",
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
			data-slot="sidebar-header"
		/>
	);
}

const sidebarFooterStyles = cva({
	base: [
		"flex flex-col p-6",
		"in-data-[intent=fleet]:mt-0 in-data-[intent=fleet]:p-0",
		"in-data-[intent=fleet]:**:data-[slot=menu-trigger]:rounded-none",
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
			data-slot="sidebar-footer"
		/>
	);
}

export function SidebarContent(props: ComponentProps<"div">) {
	const { state } = useSidebar();

	return (
		<div
			{...props}
			className={cx(
				"dark:bg-base-neutral-800 in-data-[intent=inset]:bg-base-neutral-100 bg-base-neutral-0 flex min-h-0 flex-1 scroll-mb-96 flex-col overflow-auto *:data-sidebar-section:border-l-0",
				state === "collapsed" ? "place-items-center" : "mask-b-from-95% p-4",
				props.className,
			)}
			data-slot="sidebar-content"
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
				"flex w-full min-w-0 flex-col gap-y-6",
				collapsed && "place-content-center place-items-center",
				props.className,
			)}
			data-slot="sidebar-section-group"
		/>
	);
}

type SidebarSectionProps = ComponentProps<"div"> & {
	readonly label?: string;
};

export function SidebarSection({ className, ...props }: SidebarSectionProps) {
	const { state } = useSidebar();

	return (
		<div
			{...props}
			className={cx(
				"col-span-full flex min-w-0 flex-col gap-0.5 **:data-sidebar-section:**:gap-0 **:data-sidebar-section:pr-0",
				state === "expanded" && "",
				className,
			)}
			data-slot="sidebar-section"
		>
			{state !== "collapsed" && "label" in props && (
				<RACHeader className="text-base-label-sm flex shrink-0 place-items-center rounded px-2.5 py-1 transition-[margin,opacity] duration-200 ease-linear outline-none group-data-[collapsible=dock]:-mt-8 group-data-[collapsible=dock]:opacity-0 focus-visible:ring-2 *:data-[slot=icon]:size-4 *:data-[slot=icon]:shrink-0">
					{props.label}
				</RACHeader>
			)}
			<div className="grid grid-cols-[auto_1fr] gap-0.5" data-slot="sidebar-section-inner">
				{props.children}
			</div>
		</div>
	);
}

const sidebarItemStyles = cva({
	base: [
		"group/sidebar-item relative col-span-full w-full min-w-0 cursor-pointer overflow-hidden rounded-lg px-[calc(var(--spacing)*2.3)] py-[calc(var(--spacing)*1.3)] text-left focus-visible:outline-hidden",
		"**:data-[slot=menu-trigger]:pressed:opacity-100 pressed:**:data-[slot=menu-trigger]:opacity-100 **:data-[slot=menu-trigger]:absolute **:data-[slot=menu-trigger]:right-0 **:data-[slot=menu-trigger]:-mr-1 **:data-[slot=menu-trigger]:flex **:data-[slot=menu-trigger]:h-full **:data-[slot=menu-trigger]:w-[calc(var(--sidebar-width)-90%)] **:data-[slot=menu-trigger]:items-center **:data-[slot=menu-trigger]:justify-end **:data-[slot=menu-trigger]:pr-2.5 **:data-[slot=menu-trigger]:opacity-0 hover:**:data-[slot=menu-trigger]:opacity-100 **:data-[slot=menu-trigger]:focus-visible:opacity-100 **:data-[slot=menu-trigger]:has-data-focus:opacity-100",
		"**:data-[slot=avatar]:size-4 **:data-[slot=avatar]:shrink-0 **:data-[slot=avatar]:*:size-4 **:data-[slot=icon]:size-4 **:data-[slot=icon]:shrink-0",
		"in-data-[intent=fleet]:rounded-none",
	],
	variants: {
		collapsed: {
			true: "flex size-9 place-content-center place-items-center gap-x-0 p-0 not-has-data-[slot=icon]:hidden **:data-[slot=menu-trigger]:hidden",
			false:
				"grid grid-cols-[auto_1fr_1.5rem_0.5rem_auto] items-center **:data-[slot=avatar]:mr-2 **:data-[slot=avatar]:*:mr-2 **:data-[slot=icon]:mr-2 supports-[grid-template-columns:subgrid]:grid-cols-subgrid",
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
	readonly badge?: number | string | undefined;
	readonly children?:
		| ReactNode
		| ((values: LinkRenderProps & { defaultChildren: ReactNode; isCollapsed: boolean }) => ReactNode);
	readonly isCurrent?: boolean;
	readonly tooltip?: ReactNode;
};

export function SidebarItem({ tooltip, ...props }: SidebarItemProps) {
	const { state, isMobile } = useSidebar();
	const isCollapsed = state === "collapsed" && !isMobile;

	const link = (
		<Link
			{...props}
			aria-current={props.isCurrent ? "page" : undefined}
			className={composeRenderProps(props.className, (className, { isPressed, isFocusVisible, isHovered }) =>
				sidebarItemStyles({
					isCurrent: props.isCurrent,
					collapsed: isCollapsed,
					isActive: isPressed || isFocusVisible || isHovered,
					className,
				}),
			)}
			data-slot="sidebar-item"
		>
			{(values) => (
				<>{typeof props.children === "function" ? props.children({ ...values, isCollapsed }) : props.children}</>
			)}
		</Link>
	);

	return isCollapsed && tooltip ? (
		<Tooltip delay={0}>
			{link}
			<TooltipContent
				className="**:data-[slot=icon]:hidden **:data-[slot=sidebar-label-mask]:hidden"
				placement="right"
				variant="plain"
			>
				{tooltip}
			</TooltipContent>
		</Tooltip>
	) : (
		link
	);
}

const sidebarLinkStyles = cva({
	base: "col-span-full min-w-0 shrink-0 items-center p-2 focus:outline-hidden",
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
				"relative flex min-h-dvh w-full flex-1 flex-col peer-data-[intent=inset]:border peer-data-[intent=inset]:border-transparent lg:min-w-0",
				"bg-base-neutral-0 dark:bg-base-neutral-900 dark:peer-data-[intent=inset]:bg-base-neutral-900 peer-data-[intent=inset]:overflow-hidden",
				"md:peer-data-[intent=inset]:shadow-base-md peer-data-[intent=inset]:min-h-[calc(100dvh-(--spacing(4)))] md:peer-data-[intent=inset]:m-2 md:peer-data-[intent=inset]:rounded-xl md:peer-data-[intent=inset]:peer-data-[side=left]:ml-0 md:peer-data-[intent=inset]:peer-data-[side=right]:mr-0 md:peer-data-[state=collapsed]:peer-data-[intent=inset]:peer-data-[side=left]:ml-2 md:peer-data-[state=collapsed]:peer-data-[intent=inset]:peer-data-[side=right]:mr-2",
				props.className,
			)}
			data-slot="sidebar-inset"
		/>
	);
}

export function SidebarDisclosureGroup({ allowsMultipleExpanded = true, ...props }: RACDisclosureGroupProps) {
	return (
		<RACDisclosureGroup
			{...props}
			allowsMultipleExpanded={allowsMultipleExpanded}
			className={cx(
				"col-span-full flex min-w-0 flex-col gap-y-0.5 in-data-[state=collapsed]:gap-y-1.5",
				props.className,
			)}
			data-slot="sidebar-disclosure-group"
		/>
	);
}

export function SidebarDisclosure(props: RACDisclosureProps) {
	const { state } = useSidebar();

	return (
		<RACDisclosure
			{...props}
			className={cx("col-span-full min-w-0", state === "collapsed" ? "px-2.5" : "px-4", props.className)}
			data-slot="sidebar-disclosure"
		/>
	);
}

export type SidebarDisclosureTriggerProps = RACButtonProps;

export function SidebarDisclosureTrigger({ className, ...props }: SidebarDisclosureTriggerProps) {
	const { state } = useSidebar();
	const disclosureState = use(RACDisclosureStateContext)!;

	return (
		<RACHeading level={3}>
			<RACButton
				{...props}
				className={composeRenderProps(className, (className, { isPressed, isHovered, isDisabled }) =>
					cx(
						"group/sidebar-disclosure-trigger relative col-span-full flex w-full min-w-0 place-items-center gap-2 overflow-hidden rounded-lg p-2 text-left",
						"**:data-[slot=icon]:size-5 **:data-[slot=icon]:shrink-0",
						"**:last:data-[slot=icon]:ml-auto **:last:data-[slot=icon]:size-5",
						(isPressed || isHovered) && "",
						isDisabled && "opacity-38",
						className,
					),
				)}
				slot="trigger"
			>
				{(values) => (
					<>
						{typeof props.children === "function" ? props.children(values) : props.children}
						{state !== "collapsed" && (
							<ChevronDownIcon
								aria-hidden
								className={cx(
									"z-10 ml-auto size-3.5 transition-transform duration-200",
									disclosureState.isExpanded && "rotate-180",
								)}
								data-slot="chevron"
							/>
						)}
					</>
				)}
			</RACButton>
		</RACHeading>
	);
}

export function SidebarDisclosurePanel(props: RACDisclosurePanelProps) {
	return (
		<RACDisclosurePanel
			{...props}
			className={cx("h-(--disclosure-panel-height) overflow-clip transition-[height] duration-200", props.className)}
			data-slot="sidebar-disclosure-panel"
		>
			<div
				className="col-span-full grid grid-cols-[auto_1fr] gap-y-0.5 in-data-[state=collapsed]:gap-y-1.5"
				data-slot="sidebar-disclosure-panel-content"
			>
				{props.children}
			</div>
		</RACDisclosurePanel>
	);
}

export function SidebarSeparator(props: RACSeparatorProps) {
	return (
		<RACSeparator
			{...props}
			className={cx(
				"mx-auto h-px w-[calc(var(--sidebar-width)---spacing(10))] border-0 forced-colors:bg-[ButtonBorder]",
				props.className,
			)}
			data-slot="sidebar-separator"
			orientation="horizontal"
		/>
	);
}

export function SidebarTrigger({ onPress, children, ...props }: ButtonProps) {
	const { setOpen } = useSidebar();

	return (
		<Button
			{...props}
			aria-label={props["aria-label"] ?? "Toggle Sidebar"}
			data-slot="sidebar-trigger"
			onPress={(event) => {
				onPress?.(event);
				setOpen((open) => !open);
			}}
			size="icon-sm"
			variant="filled"
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
				"absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 outline-hidden transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] data-hovered:after:bg-transparent sm:flex",
				"in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
				"[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
				"group-data-[collapsible=hidden]:hover:bg-secondary group-data-[collapsible=hidden]:translate-x-0 group-data-[collapsible=hidden]:after:left-full",
				"[[data-side=left][data-collapsible=hidden]_&]:-right-2 [[data-side=right][data-collapsible=hidden]_&]:-left-2",
				className,
			)}
			data-slot="sidebar-rail"
			onClick={() => setOpen((open) => !open)}
			ref={ref}
			tabIndex={-1}
			title="Toggle Sidebar"
			type="button"
			{...props}
		/>
	);
}

export function SidebarLabel(props: ComponentProps<typeof RACText>) {
	const { state, isMobile } = useSidebar();
	const collapsed = state === "collapsed" && !isMobile;

	if (collapsed) {
		return null;
	}

	return (
		<RACText
			{...props}
			className={cx("col-start-2 overflow-hidden whitespace-nowrap outline-hidden", props.className)}
			data-slot="sidebar-label"
			slot="label"
			tabIndex={-1}
		/>
	);
}

export type SidebarNavProps = ComponentProps<"nav"> & {
	readonly isSticky?: boolean;
};

export function SidebarNav({ isSticky = false, ...props }: SidebarNavProps) {
	return (
		<nav
			{...props}
			className={cx(
				"isolate flex place-content-between place-items-center gap-x-2 p-4 sm:justify-start md:w-full",
				isSticky && "static top-0 z-40 group-has-data-[intent=default]/sidebar-root:sticky",
				props.className,
			)}
			data-slot="sidebar-nav"
		/>
	);
}

export type SidebarMenuTriggerProps = RACButtonProps & {
	readonly alwaysVisible?: boolean;
};

export function SidebarMenuTrigger({ alwaysVisible = false, ...props }: SidebarMenuTriggerProps) {
	return (
		<RACButton
			{...props}
			className={composeRenderProps(props.className, (className) =>
				cx(
					!alwaysVisible &&
						"pressed:opacity-100 group/sidebar-item:pressed:opacity-100 opacity-0 group-hover/sidebar-item:opacity-100 group-focus-visible/sidebar-item:opacity-100",
					"absolute right-0 flex h-full w-[calc(var(--sidebar-width)-90%)] place-content-end place-items-center pr-2.5 outline-hidden",
					'**:data-[slot=icon]:shrink-0 [&_[data-slot="icon"]:not([class*="size-"])]:size-5',
					className,
				),
			)}
			data-slot="menu-trigger"
		/>
	);
}

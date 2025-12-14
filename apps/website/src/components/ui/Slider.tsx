import { use, type ComponentProps, type HTMLAttributes } from "react";
import type {
	SliderProps as RACSliderProps,
	SliderTrackProps as RACSliderTrackProps,
	SliderThumbProps as RACSliderThumbProps,
} from "react-aria-components";
import {
	composeRenderProps,
	Slider as RACSlider,
	SliderOutput as RACSliderOutput,
	SliderThumb as RACSliderThumb,
	SliderTrack as RACSliderTrack,
	SliderStateContext,
} from "react-aria-components";
import { cva, cx } from "@/styles/cva";

export function SliderGroup(props: ComponentProps<"div">) {
	return <div {...props} className="flex place-items-center" />;
}

const sliderStyles = cva({
	base: "group relative flex touch-none flex-col select-none",
	variants: {
		orientation: {
			horizontal: "w-full min-w-56 gap-2",
			vertical: "h-full min-h-56 w-fit place-items-center gap-4",
		},
		isDisabled: {
			true: "opacity-38",
		},
	},
});

export function Slider(props: RACSliderProps) {
	return (
		<RACSlider
			{...props}
			className={composeRenderProps(props.className, (className, renderProps) =>
				sliderStyles({ ...renderProps, className }),
			)}
			data-slot="control"
		/>
	);
}

export function SliderOutput({ className, ...props }: ComponentProps<typeof RACSliderOutput>) {
	return <RACSliderOutput {...props} className={cx("text-base-label-md", className)} />;
}

const thumbStyles = cva({
	base: "top-[50%] left-[50%] size-5 rounded-full border bg-neutral-100 outline-hidden transition-[width,height] dark:bg-neutral-900",
	variants: {
		isFocusVisible: {
			true: "border-2 outline-2 outline-offset-2 forced-colors:outline-[Highlight]",
		},
		isDragging: {
			true: "size-[1.35rem] cursor-grabbing",
		},
		isDisabled: {
			true: "forced-colors:border-[GrayText]",
		},
	},
});

export function SliderThumb(props: RACSliderThumbProps) {
	return (
		<RACSliderThumb
			{...props}
			className={composeRenderProps(props.className, (className, renderProps) =>
				thumbStyles({ ...renderProps, className }),
			)}
		/>
	);
}

const fillerStyles = cva({
	base: "group-orientation-horizontal/top-0 bg-base-tangerine-600 group-orientation-vertical/track:bottom-0 group-orientation-horizontal/track:h-full group-orientation-vertical/track:w-full dark:bg-base-tangerine-500 pointer-events-none absolute rounded-full",
});

export function SliderFill(props: HTMLAttributes<HTMLDivElement>) {
	const state = use(SliderStateContext);
	const { orientation, getThumbPercent, values } = state ?? {};

	const getStyle = () => {
		const percent0 = getThumbPercent ? getThumbPercent(0) * 100 : 0;
		const percent1 = getThumbPercent ? getThumbPercent(1) * 100 : 0;

		if (values?.length === 1) {
			return orientation === "horizontal" ? { width: `${percent0}%` } : { height: `${percent0}%` };
		}

		return orientation === "horizontal"
			? {
					left: `${percent0}%`,
					width: `${Math.abs(percent0 - percent1)}%`,
				}
			: {
					bottom: `${percent0}%`,
					height: `${Math.abs(percent0 - percent1)}%`,
				};
	};

	return <div {...props} className={fillerStyles({ className: props.className })} style={getStyle()} />;
}

const trackStyles = cva({
	base: "group/track group-orientation-horizontal:h-1.5 group-orientation-horizontal:w-full group-orientation-vertical:w-1.5 group-orientation-vertical:flex-1 relative grow cursor-pointer rounded-full bg-neutral-300 dark:bg-neutral-700",
	variants: {
		isDisabled: {
			true: "cursor-default",
		},
	},
});

export function SliderTrack(props: RACSliderTrackProps) {
	return (
		<RACSliderTrack
			{...props}
			className={composeRenderProps(props.className, (className, renderProps) =>
				trackStyles({ ...renderProps, className }),
			)}
		>
			{(values) => (
				<>
					{typeof props.children === "function"
						? props.children(values)
						: (props.children ?? (
								<>
									<SliderFill />
									<SliderThumb />
								</>
							))}
				</>
			)}
		</RACSliderTrack>
	);
}

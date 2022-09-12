import { redDark, blueDark, greenDark, grayDark } from "@radix-ui/colors";
import { createStitches } from "@stitches/react";

export const { styled, globalCss, getCssText, reset } = createStitches({
	theme: {
		colors: {
			...redDark,
			...blueDark,
			...greenDark,
			...grayDark,
		},
	},
});

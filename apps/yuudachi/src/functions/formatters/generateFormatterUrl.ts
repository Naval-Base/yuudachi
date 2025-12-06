export function generateFormatterUrl(file: string) {
	const url = new URL(`${process.env.REPORT_FORMATTER_URL!}?url=${file}`);

	return url.toString();
}

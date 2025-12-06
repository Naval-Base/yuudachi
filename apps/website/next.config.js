import { fileURLToPath } from "node:url";
import bundleAnalyzer from "@next/bundle-analyzer";

const { REPORT_URL } = process.env;

const withBundleAnalyzer = bundleAnalyzer({
	enabled: process.env.ANALYZE === "true",
});

/**
 * @type {import('next').NextConfig}
 */
export default withBundleAnalyzer({
	reactStrictMode: true,
	outputFileTracing: true,
	experimental: {
		outputFileTracingRoot: fileURLToPath(new URL("../../", import.meta.url)),
	},
	images: {
		dangerouslyAllowSVG: true,
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
	},
	async rewrites() {
		return [
			{
				source: "/:path*",
				destination: `/:path*`,
			},
			{
				source: "/report",
				destination: `${REPORT_URL}/report`,
			},
			{
				source: "/report/:path*",
				destination: `${REPORT_URL}/report/:path*`,
			},
		];
	},
});

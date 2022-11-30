/* eslint-disable tsdoc/syntax */
import process from "node:process";
import { URL, fileURLToPath } from "node:url";
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
	eslint: {
		ignoreDuringBuilds: true,
	},
	cleanDistDir: true,
	outputFileTracing: true,
	experimental: {
		appDir: true,
		outputFileTracingRoot: fileURLToPath(new URL("../../", import.meta.url)),
		fallbackNodePolyfills: false,
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

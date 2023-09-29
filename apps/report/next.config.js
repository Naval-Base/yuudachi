/* eslint-disable tsdoc/syntax */
import process from "node:process";
import { URL, fileURLToPath } from "node:url";
import bundleAnalyzer from "@next/bundle-analyzer";

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
	basePath: "/report",
});

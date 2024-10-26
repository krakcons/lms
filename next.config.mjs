import createMDX from "@next/mdx";
import { withAxiom } from "next-axiom";
import nextIntl from "next-intl/plugin";

const withNextIntl = nextIntl();

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
	async rewrites() {
		return [
			{
				source: "/:locale/r2/:slug*",
				destination: "https://cdn.revivios.com/:slug*",
				locale: false,
			},
		];
	},
	async redirects() {
		return [
			{
				source: "/:path*/scormcontent/0",
				destination: "/:path*/scormcontent/index.html",
				permanent: true,
			},
		];
	},
	async headers() {
		return [
			{
				source: "/api/:path*",
				headers: [
					{ key: "Access-Control-Allow-Origin", value: "*" }, // replace this your actual origin
					{
						key: "Access-Control-Allow-Methods",
						value: "GET,DELETE,PATCH,POST,PUT,OPTIONS",
					},
					{
						key: "Access-Control-Allow-Headers",
						value: "x-api-token, Content-Type",
					},
				],
			},
		];
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "cdn.revivios.com",
				port: "",
			},
		],
	},
	experimental: {
		ppr: true,
		mdxRs: false,
	},
};

const withMDX = createMDX({
	options: {
		remarkPlugins: [],
		rehypePlugins: [],
	},
});

export default withAxiom(withMDX(withNextIntl(nextConfig)));

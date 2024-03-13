const withNextIntl = require("next-intl/plugin")();

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	// experimental: {
	// 	ppr: true,
	// },
};

module.exports = withNextIntl(nextConfig);

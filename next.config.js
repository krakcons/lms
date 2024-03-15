const withNextIntl = require("next-intl/plugin")();

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	// Need to fix 404 on courses
	experimental: {
		ppr: true,
	},
};

module.exports = withNextIntl(nextConfig);

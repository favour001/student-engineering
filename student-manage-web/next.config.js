/** @type {import('next').NextConfig} */
const configuredBasePath =
  process.env.NEXT_PUBLIC_BASE_PATH || process.env.NEXT_BASE_PATH || "";

const nextConfig = {
  basePath: configuredBasePath,
  assetPrefix: configuredBasePath,
  reactStrictMode: true,
};

export default nextConfig;

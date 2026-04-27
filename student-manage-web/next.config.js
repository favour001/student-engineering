/** @type {import('next').NextConfig} */
const configuredBasePath =
  process.env.NEXT_PUBLIC_BASE_PATH || process.env.NEXT_BASE_PATH || "";
const imageProxyTarget = (
  process.env.NEXT_PUBLIC_IMAGE_PROXY_TARGET || "https://sdsosa.com"
).replace(/\/+$/, "");

const nextConfig = {
  basePath: configuredBasePath,
  assetPrefix: configuredBasePath,
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/image/:path*",
        destination: `${imageProxyTarget}/image/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${imageProxyTarget}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;

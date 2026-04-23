/** @type {import('next').NextConfig} */
const imageProxyTarget =
  process.env.NEXT_PUBLIC_IMAGE_PROXY_TARGET ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:8888";

const nextConfig = {
  basePath: "/student-admin",
  async rewrites() {
    return [
      {
        source: "/image/:path*",
        destination: `${imageProxyTarget}/image/:path*`,
      },
    ];
  },
};

export default nextConfig;

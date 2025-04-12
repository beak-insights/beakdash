/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Transpile specific third-party modules if needed
  transpilePackages: [],
  // Customize the build output
  output: 'standalone',
  // Setup image domains for `next/image` optimization
  images: {
    domains: ['img.clerk.com'],
  },
  // Cross-origin permissions for development
  // This helps with Clerk's authentication requests
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
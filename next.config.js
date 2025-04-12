/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Transpile specific third-party modules if needed
  transpilePackages: [],
  // Configure server-side aspects
  experimental: {
    // Enable App Router, React Server Components, etc.
    serverActions: true,
  },
  // Customize the build output
  output: 'standalone',
  // Setup image domains for `next/image` optimization
  images: {
    domains: [],
  },
};

module.exports = nextConfig;
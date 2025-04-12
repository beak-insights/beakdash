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
    domains: [],
  }
};

export default nextConfig;
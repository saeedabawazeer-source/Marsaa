/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  swcMinify: false,
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
};

export default nextConfig;

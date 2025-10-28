/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Image optimization for Cloudinary
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'caffetest.onrender.com',
      },
    ],
    unoptimized: false,
  },
  
  // Handle external packages
  transpilePackages: ['lucide-react', 'framer-motion'],
};

export default nextConfig;
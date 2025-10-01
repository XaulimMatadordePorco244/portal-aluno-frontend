import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tiahnwnyredges0d.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};



export default nextConfig;


 
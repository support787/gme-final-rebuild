// next.config.mjs
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/v0/b/grand-medical-website.firebasestorage.app/**',
      },
    ],
  },
};

export default nextConfig;
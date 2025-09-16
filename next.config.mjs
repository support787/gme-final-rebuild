/** @type {import('next').NextConfig} */
const nextConfig = {
  // This is the critical line that tells Next.js to create the 'out' folder.
  // output: 'export',
  
  // This is needed for images to work correctly in a static export.
  images: {
    unoptimized: true,
    // Add the allowed image domains here
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
};

export default nextConfig;

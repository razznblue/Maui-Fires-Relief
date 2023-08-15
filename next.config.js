/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Allow access to any domain
      },
    ],
  },
  nftTracing: true 
}

module.exports = nextConfig;
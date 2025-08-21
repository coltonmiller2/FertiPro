/** @type {import('next').NextConfig} */
const nextConfig = {
  devServer: {
    allowedDevOrigins: [
        "https://*.cloudworkstations.dev",
    ],
  },
};

export default nextConfig;

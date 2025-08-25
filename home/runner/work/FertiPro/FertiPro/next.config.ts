/** @type {import('next').NextConfig} */
const nextConfig = {
  // This configuration is essential for Firebase Authentication to work correctly
  // in development environments like the one used by this tool. It ensures that
  // the development server's origin is properly recognized by Firebase.
  devServer: {
    allowedDevOrigins: [
        "https://*.cloudworkstations.dev",
    ],
  },
};

export default nextConfig;

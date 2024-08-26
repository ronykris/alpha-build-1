/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
      config.experiments = {
        ...config.experiments,
        asyncWebAssembly: true,
        layers: true,
      };
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
      // Optional: Add this if you need to handle .wasm files explicitly
      config.resolve.extensions.push('.wasm');
  
      return config;
    },
    // Add other Next.js config options here
  };
export default nextConfig;
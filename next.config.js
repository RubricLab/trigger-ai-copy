/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.externals.push("chrome-aws-lambda", "puppeteer-core");
    }

    return config;
  },
};

module.exports = nextConfig;

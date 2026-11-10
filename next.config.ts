import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // The route reads the built widget off disk at request time, so the bundle
  // has to be traced into the serverless function.
  outputFileTracingIncludes: {
    "/mcp": ["widget/dist/index.html"],
  },
};

export default nextConfig;

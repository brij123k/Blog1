import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  transpilePackages: [
    "three",
    "@react-three/fiber",
    "@react-three/drei",
    "@react-three/postprocessing",
  ],
  allowedDevOrigins: [
    "0b17-111-223-30-28.ngrok-free.app",
  ],
};

export default nextConfig;
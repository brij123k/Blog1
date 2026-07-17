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
  
};
module.exports = {
  allowedDevOrigins: [
    "0bcc-111-223-30-55.ngrok-free.app",
  ],
};

export default nextConfig;
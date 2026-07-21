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
    "1029-2409-40e3-209f-324d-f9f4-b4c5-14bf-ea30.ngrok-free.app",
  ],
};

export default nextConfig;
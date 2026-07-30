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
    "95d8-2409-40e3-2002-5b51-4074-93a6-29fb-d372.ngrok-free.app",
  ],
};

export default nextConfig;
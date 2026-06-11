import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
   transpilePackages: ["three", "@react-three/fiber", "@react-three/drei", "@react-three/postprocessing"]
};

export default nextConfig;
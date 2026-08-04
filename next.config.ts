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
// module.exports = {
//   allowedDevOrigins: [
//     "746f-2409-40e3-20cd-325f-9844-d8ae-3559-4f2c.ngrok-free.app",
//   ],
// };

export default nextConfig;
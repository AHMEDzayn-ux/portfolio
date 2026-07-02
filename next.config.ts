import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React Compiler is disabled: it's incompatible with React Hook Form
  // (memoization breaks how RHF pre-fills uncontrolled inputs from
  // defaultValues), which left every admin edit form blank.
  reactCompiler: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // Supabase Storage already serves optimized files, and Next's image
    // proxy does its own DNS lookup that some networks (NAT64/DNS64) route
    // through addresses it flags as private — skip the proxy entirely and
    // let the browser fetch these directly.
    unoptimized: true,
  },
};

export default nextConfig;

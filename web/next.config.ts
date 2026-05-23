import type { NextConfig } from "next";

const normalizedBasePath = (() => {
  const rawBasePath = process.env.NEXT_PUBLIC_APP_BASE_PATH?.trim();

  if (!rawBasePath || rawBasePath === "/") {
    return "";
  }

  const withLeadingSlash = rawBasePath.startsWith("/")
    ? rawBasePath
    : `/${rawBasePath}`;

  return withLeadingSlash.replace(/\/+$/, "");
})();

const nextConfig: NextConfig = {
  basePath: normalizedBasePath || undefined,
};

export default nextConfig;

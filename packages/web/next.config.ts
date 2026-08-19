import type { NextConfig } from "next";

const mediaBucketUrl = process.env.NEXT_PUBLIC_MEDIA_BUCKET_URL;

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  {
    protocol: "https",
    hostname: "media*.giphy.com",
  },
  {
    protocol: "https",
    hostname: "i.giphy.com",
  },
];

if (mediaBucketUrl) {
  remotePatterns.push({
    protocol: "https",
    hostname: new URL(mediaBucketUrl).hostname,
  });
}

const nextConfig: NextConfig = {
  experimental: {
    turbopackUseSystemTlsCerts: true,
  },
  images: {
    remotePatterns,
  },
};

export default nextConfig;

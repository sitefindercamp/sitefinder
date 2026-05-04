import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent the site from being embedded in iframes (clickjacking)
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Stop browsers from MIME-sniffing the content type
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Only send the origin as the referrer (no full URL leakage)
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Restrict browser features we don't use
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      // ── WordPress directory pages ──────────────────────────────────────
      {
        source: "/business-directory",
        destination: "/spas",
        permanent: true,
      },
      // Individual listing pages (/Listings or /Listings/some-spa-slug)
      {
        source: "/Listings",
        destination: "/spas",
        permanent: true,
      },
      {
        source: "/Listings/:slug*",
        destination: "/spas",
        permanent: true,
      },

      // ── WordPress blog / guide posts at root level ─────────────────────
      // Redirect to matching new slug under /guides or /blog.
      // If the post doesn't exist in the new CMS it will 404 there gracefully.
      {
        source: "/korean-spa-wet-area-shower",
        destination: "/guides/korean-spa-wet-area-shower",
        permanent: true,
      },
      {
        source: "/gender-are-korean-spas-separated",
        destination: "/guides/gender-are-korean-spas-separated",
        permanent: true,
      },
      {
        source: "/how-kspas-improved-my-body-confidence",
        destination: "/blog/how-kspas-improved-my-body-confidence",
        permanent: true,
      },
      {
        source: "/video-tour-and-instructions-for-korean-spa",
        destination: "/guides/video-tour-and-instructions-for-korean-spa",
        permanent: true,
      },
      {
        source: "/what-do-korean-spas-use-to-exfoliate",
        destination: "/guides/what-do-korean-spas-use-to-exfoliate",
        permanent: true,
      },

      // ── WordPress system / admin URLs ──────────────────────────────────
      {
        source: "/wp-admin/:path*",
        destination: "/",
        permanent: false,
      },
      {
        source: "/wp-login.php",
        destination: "/",
        permanent: false,
      },
      {
        source: "/wp-content/:path*",
        destination: "/",
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mqkjumltnmkpmkkqdmcn.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Allow any HTTPS image URL (used for admin-pasted featured images)
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  compress: true,
  experimental: {
    outputFileTracingIncludes: {
      "/api/parse-resume": [
        "./node_modules/pdf-parse/**/*",
        "./node_modules/pdfjs-dist/**/*"
      ]
    }
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://checkout.razorpay.com https://accounts.google.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; frame-src https://api.razorpay.com https://accounts.google.com; connect-src 'self' https://api.openai.com https://api.razorpay.com https://*.supabase.co https://iqzkcrvmcvlmwfweltie.supabase.co https://*.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://*.g.doubleclick.net https://www.google.com https://*.google.com https://*.google.co.in https://*.google.adservices.com; font-src 'self'" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ]
  },
}

export default nextConfig

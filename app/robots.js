export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard/", "/profile/", "/checkout/", "/onboarding/", "/auth/callback"],
    },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || "https://careerdeck.xyz"}/sitemap.xml`,
  };
}

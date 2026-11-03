import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { REPO, SITE_URL, VERSION, absoluteUrl, dogs, site } from "@/lib/site";
import "./globals.css";

const sans = Geist({ subsets: ["latin"], variable: "--font-sans" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
// GoatCounter site code: cookieless visitor counts (no personal data stored), read by the admin dashboard.
const goatcounter = process.env.NEXT_PUBLIC_GOATCOUNTER_CODE;

export const metadata: Metadata = {
  // Origin only: Next prepends basePath to file-based metadata images itself.
  metadataBase: new URL(new URL(SITE_URL).origin),
  title: { default: site.title, template: `%s · ${site.name}` },
  description: site.metaDescription,
  applicationName: site.name,
  keywords: site.keywords,
  authors: [{ name: site.author.name, url: site.author.url }],
  creator: site.author.name,
  category: "Developer Tools",
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    type: "website",
    url: absoluteUrl("/"),
    siteName: site.name,
    title: site.title,
    description: site.metaDescription,
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title: site.title, description: site.metaDescription },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  ...(googleVerification ? { verification: { google: googleVerification } } : {}),
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f5f8" },
    { media: "(prefers-color-scheme: dark)", color: "#05080d" },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
};

// Structured data: lets Google show the app as a rich result (free, rating-free SoftwareApplication),
// expand the FAQ, and gives answer engines clean facts to quote.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: absoluteUrl("/"),
      name: "Watchdog Lab",
      description: "Security for autonomous coding. AI writes the code. Watchdog guards it.",
      inLanguage: "en",
      publisher: { "@id": `${SITE_URL}/#author` },
    },
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#author`,
      name: site.author.name,
      url: site.author.url,
      sameAs: [site.author.github],
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#app`,
      name: site.name,
      alternateName: ["Watchdog for Claude Code", "Watchdog security plugin"],
      description: site.description,
      url: absoluteUrl("/watchdog/"),
      installUrl: absoluteUrl("/watchdog/#install"),
      codeRepository: REPO,
      softwareVersion: VERSION,
      operatingSystem: "Any (runs in Claude Code)",
      applicationCategory: "DeveloperApplication",
      applicationSubCategory: "Security review, VAPT, Claude Code plugin",
      isAccessibleForFree: true,
      license: "https://opensource.org/licenses/MIT",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      image: absoluteUrl("/watchdog-icon.png"),
      featureList: dogs.map((d) => `${d.name}: ${d.role} (${d.cmd})`),
      author: { "@id": `${SITE_URL}/#author` },
    },
  ],
};

// Applies a saved light/dark choice before first paint; no saved choice means follow the system.
const themeScript = `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a href="#main" className="skip">Skip to content</a>
        {children}
        {goatcounter && (
          <script data-goatcounter={`https://${goatcounter}.goatcounter.com/count`} async src="https://gc.zgo.at/count.js" />
        )}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}

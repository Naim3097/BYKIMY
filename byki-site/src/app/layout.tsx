import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { getOrganizationSchema, getWebSiteSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: {
    default: "BYKI — Car Diagnostics App for Malaysia",
    template: "%s | BYKI",
  },
  description:
    "Diagnose your car with BYKI. Read fault codes, get AI-powered reports, and understand what's wrong — all from your phone.",
  metadataBase: new URL("https://byki.my"),
  openGraph: {
    type: "website",
    locale: "en_MY",
    siteName: "BYKI",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <JsonLd data={getOrganizationSchema()} />
        <JsonLd data={getWebSiteSchema()} />
        <Header />
        <main id="main-site">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

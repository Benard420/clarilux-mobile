import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ConceptNotice } from "@/components/concept-notice";

export const metadata: Metadata = {
  title: "Clarilux",
  description:
    "Clarilux is a concept mobile app for booking oral board practice with real examiners and sitting the mock exam itself. Independent design exercise by Sandra Benard.",
  manifest: "/manifest.webmanifest",
  applicationName: "Clarilux",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Clarilux" },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        />
        <script suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('clarilux-theme');if(t&&t!=='system')document.documentElement.setAttribute('data-theme',t)}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-dvh">
        {children}
        <ConceptNotice />
      </body>
    </html>
  );
}

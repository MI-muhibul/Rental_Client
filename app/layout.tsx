import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "HEAVYRENT // Heavy Equipment & Machinery Rental Marketplace",
  description:
    "Bold industrial equipment rental platform for excavators, loaders, compaction, and commercial construction machinery.",
  keywords: ["equipment rental", "machinery rental", "heavy equipment", "excavators", "contractors", "construction fleet"],
  authors: [{ name: "HEAVYRENT Fleet Logistics" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
  themeColor: "#ff6600",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="industrial"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme');
                  var theme = stored || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'industrial-light' : 'industrial');
                  document.documentElement.setAttribute('data-theme', theme);
                  if (theme === 'industrial-light') {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  } else {
                    document.documentElement.classList.remove('light');
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-body bg-base-100 text-base-content selection:bg-primary selection:text-white">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#1a1e24",
              color: "#f4f3ee",
              border: "1px solid #2b323c",
              borderRadius: "0.25rem",
              fontFamily: "var(--font-body)",
              fontSize: "0.875rem",
            },
            success: {
              iconTheme: {
                primary: "#ff6600",
                secondary: "#ffffff",
              },
            },
          }}
        />
      </body>
    </html>
  );
}

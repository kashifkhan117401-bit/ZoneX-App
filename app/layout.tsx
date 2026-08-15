import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZoneX — AI Product Photography & Model Studio",
  description:
    "Generate professional AI product photos and realistic AI model photoshoots for your e-commerce brand — no physical photoshoot required.",
  keywords: "AI product photography, AI model, e-commerce, product photos, virtual photoshoot",
  openGraph: {
    title: "ZoneX — AI Product Photography Studio",
    description: "Professional AI-generated product photos and model shots for e-commerce",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        </head>
        <body>
          {children}
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: "var(--bg-overlay)",
                border: "1px solid var(--border-default)",
                color: "var(--text-primary)",
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}

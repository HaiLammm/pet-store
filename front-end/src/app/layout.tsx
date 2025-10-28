import type { Metadata } from "next";
import type React from "react";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import HideOnAdmin from "@/components/layout/HideOnAdmin";
import { Toaster } from "@/components/ui/sonner";
import ThemeProvider from "@/components/layout/theme-provider";
import I18nProvider from "@/components/layout/i18n-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LilyDrogon",
  description: "LilyDrogon Cattery",
  icons: {
    // Use the logo under public/images/logo/paw-9.png
    icon: [{ url: "/images/logo/paw-9.png", type: "image/png" }],
    apple: [{ url: "/images/logo/paw-9.png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <ThemeProvider>
          <I18nProvider>
            <div className="flex min-h-screen flex-col">
              <HideOnAdmin>
                <Navbar />
              </HideOnAdmin>
              <main className="flex-1">{children}</main>
              <HideOnAdmin>
                <Footer />
              </HideOnAdmin>
            </div>
            <Toaster richColors closeButton position="top-right" />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

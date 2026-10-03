import type { Metadata } from "next";
import "./globals.css";
import AppLayout from "@/components/AppLayout";
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: "500 KM Project",
  description: "The 500 KM Project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Analytics/>
        <AppLayout>
          {children}
        </AppLayout>
      </body>
    </html>
  );
}

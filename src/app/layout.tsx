import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Toothpillow Submission Dashboard",
  description: "Daily submission tracking and analytics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-gray-50 antialiased" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>{children}</body>
    </html>
  );
}

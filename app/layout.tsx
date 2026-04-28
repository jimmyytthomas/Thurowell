import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Thurowell",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-900 antialiased text-white">
        {children}
      </body>
    </html>
  );
}

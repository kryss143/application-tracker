import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JobLedger — Track Your Applications",
  description: "A refined job application tracker for serious job seekers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/icon.png" sizes="any" />
      </head>
      <body className="font-body bg-ink-950 text-ink-100 antialiased">
        {children}
      </body>
    </html>
  );
}

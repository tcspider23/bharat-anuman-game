import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bharat Anuman — Think of Someone, I'll Guess Who",
  description:
    "An Indian AI guessing game starring Detective Anuman. Think of any Indian personality — cricketer, actor, singer, leader — and let the detective guess them.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Nunito:wght@400;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="ba-bg text-white antialiased">{children}</body>
    </html>
  );
}

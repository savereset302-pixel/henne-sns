import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ['300', '400', '600', '700'],
  variable: '--font-outfit'
});

export const metadata: Metadata = {
  title: "本音共有SNS | 自分の哲学を語る場所",
  description: "世間の目を気にせず、あなたの本音や哲学を共有しよう。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${outfit.variable}`}>
        {children}
      </body>
    </html>
  );
}

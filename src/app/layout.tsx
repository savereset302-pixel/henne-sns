import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/context/LanguageContext";
import "./globals.css";
import JsonLd from "@/components/JsonLd";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ['300', '400', '600', '700'],
  variable: '--font-outfit'
});

export const metadata: Metadata = {
  title: "Honne. - 本音共有SNS | 自分の哲学を語る場所",
  description: "世間の目を気にせず、あなたの本音や哲学を共有しよう。匿名投稿、AIコメント、感情カラーなど、他にはない機能で安心して本音を語れるSNS。",
  keywords: ["本音", "SNS", "哲学", "匿名", "AI", "感情", "独白", "コミュニティ"],
  authors: [{ name: "Honne Team" }],
  openGraph: {
    title: "Honne. - 本音共有SNS",
    description: "世間の目を気にせず、あなたの本音や哲学を共有しよう。",
    url: "https://henne-sns.vercel.app",
    siteName: "Honne.",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Honne. - 本音共有SNS",
    description: "世間の目を気にせず、あなたの本音や哲学を共有しよう。",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  verification: {
    google: 'z3DdMX1Kb8M6J_YgRkIiAt3TMdZhr-XHo6HceDmtI7c',
  },
};

// ThemeProvider is already imported above

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <meta name="google-site-verification" content="z3DdMX1Kb8M6J_YgRkIiAt3TMdZhr-XHo6HceDmtI7c" />
      </head>
      <body className={`${outfit.variable}`}>
        <ThemeProvider>
          <LanguageProvider>
            <JsonLd />
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

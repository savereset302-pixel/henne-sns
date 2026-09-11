import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/context/LanguageContext";
import { SoundProvider } from "@/context/SoundContext";
import "./globals.css";
import JsonLd from "@/components/JsonLd";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ['300', '400', '600', '700'],
  variable: '--font-outfit'
});

export const metadata: Metadata = {
  title: "Shizunari. - 静寂と本音のSNS | 自分の哲学を語る場所",
  description: "喧騒を離れ、心の内なる音に耳を澄ます場所。世間の目を気にせず、あなたの本音や哲学を共有しよう。匿名投稿、AI思索、環境音、感情カレンダーで安心して本音を語れるSNS。",
  keywords: ["Shizunari", "シズナリ", "本音", "静寂", "SNS", "哲学", "匿名", "AI", "感情", "環境音", "ジャーナル"],
  authors: [{ name: "Shizunari Team" }],
  openGraph: {
    title: "Shizunari. - 静寂と本音のSNS",
    description: "喧騒を離れ、心の内なる音に耳を澄ます場所。あなたの本音や哲学を静かに共有しよう。",
    url: "https://henne-sns.vercel.app",
    siteName: "Shizunari.",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shizunari. - 静寂と本音のSNS",
    description: "喧騒を離れ、心の内なる音に耳を澄ます場所。あなたの本音や哲学を静かに共有しよう。",
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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Shizunari."
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
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="theme-color" content="#0a0a14" />
      </head>
      <body className={`${outfit.variable}`}>
        <ThemeProvider>
          <LanguageProvider>
            <SoundProvider>
              <JsonLd />
              {children}
            </SoundProvider>
          </LanguageProvider>
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `
          }}
        />
      </body>
    </html>
  );
}

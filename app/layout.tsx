import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  // サイトのベースURL（これを設定するとSNSが画像を正しく見つけられます）
  metadataBase: new URL("https://endfield-schedule.vercel.app"),

  title: "Arknights: Endfield Schedule",
  description: "Unofficial event schedule manager for Arknights: Endfield. Track events, gachas, and campaigns.",
  
  openGraph: {
    title: "Arknights: Endfield Schedule",
    description: "Check the latest event schedule and manage your plans.",
    url: "https://endfield-schedule.vercel.app",
    siteName: "Endfield Schedule",
    images: [
      {
        url: "/banner.png", // ★ここが画像ファイル名と一致しているか確認！
        width: 1200,
        height: 630,
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  
  twitter: {
    card: "summary_large_image",
    title: "Arknights: Endfield Schedule",
    description: "Check the latest event schedule and manage your plans.",
    images: ["/banner.png"], // ★ここも一致させる
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
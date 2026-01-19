import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// ★ここがOGP設定です！
export const metadata: Metadata = {
  title: "Arknights: Endfield Schedule",
  description: "Unofficial event schedule manager for Arknights: Endfield. Track events, gachas, and campaigns.",
  openGraph: {
    title: "Arknights: Endfield Schedule",
    description: "Check the latest event schedule and manage your plans.",
    url: "https://endfield-schedule.vercel.app", // ★あなたのVercelのURLに書き換えてください
    siteName: "Endfield Schedule",
    images: [
      {
        url: "/og-image.png", // publicフォルダに入れた画像の名前
        width: 1200,
        height: 630,
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image", // 大きい画像で表示する設定
    title: "Arknights: Endfield Schedule",
    description: "Check the latest event schedule and manage your plans.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
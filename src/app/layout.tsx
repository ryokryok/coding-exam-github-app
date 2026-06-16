import type { Metadata } from "next";
import { Geist_Mono, M_PLUS_Rounded_1c } from "next/font/google";
import "./globals.css";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/page-header";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ページ全体に適用するポップな丸ゴシック（日本語対応）。UI で使う 400/500/700。
const mPlusRounded = M_PLUS_Rounded_1c({
  weight: ["400", "500", "700"],
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Repo Digger",
  description: "GitHub のリポジトリを検索・閲覧できるアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${mPlusRounded.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="flex flex-1 flex-col bg-white dark:bg-black">
          <PageHeader title="Repo Digger" />
          <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

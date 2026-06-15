import type { Metadata } from "next";
import { DotGothic16, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/page-header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ページ全体に適用するドット系日本語フォント。weight は 400 のみ。
const dotGothic16 = DotGothic16({
  weight: "400",
  variable: "--font-dot-gothic",
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
      className={`${geistSans.variable} ${geistMono.variable} ${dotGothic16.variable} h-full antialiased`}
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

import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "./utils/style/helper";
import Providers from "./providers";

const globalFont = localFont({
  src: "./PretendardVariable.woff2",
  display: "swap",
  variable: "--font-pretendard",
});

export const metadata: Metadata = {
  title: "WaMaDae",
  description: "WaMaDae WEB",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full overflow-hidden" suppressHydrationWarning>
      <body
        className={cn(
          globalFont.variable,
          "font-pretendard",
          "flex h-[100dvh] justify-center overflow-hidden bg-white"
        )}
      >
        <Providers>
          <div className="h-[100dvh] overflow-hidden bg-white">
            {/* 바디 영역: w-350 고정 */}
            <div className="h-[100dvh] w-[350px] overflow-hidden bg-white pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}

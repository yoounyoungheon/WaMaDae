import type { Metadata } from "next";
import localFont from 'next/font/local';
import "./globals.css";
import { cn } from "./utils/style/helper";

const globalFont = localFont({
  src: './PretendardVariable.woff2',
  display: 'swap',
  variable: '--font-pretendard'
})

export const metadata: Metadata = {
  title: "WaMaDae",
  description: "WaMaDae WEB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(globalFont.variable, 'font-pretendard', 'bg-gray-50')}
      >
        {children} 
      </body>
    </html>
  );
}

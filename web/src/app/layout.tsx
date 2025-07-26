import type { Metadata } from "next";
import localFont from 'next/font/local';
import "./globals.css";
import { cn } from "./utils/style/helper";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';

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
        className={cn(globalFont.variable, 'font-pretendard', 'flex justify-center', )}
      >
        <AppRouterCacheProvider>
          <div>
            {/* 상단 배너 영역 */}
            <div className="flex flex-row justify-between gap-3 bg-mysom-primary text-white px-5 py-3 font-bold text-xl items-center ">
              <div className="flex flex-row items-center gap-3"> 
                <p>🍷</p>
                <p>MySom</p>
              </div>
              <ShareOutlinedIcon />
            </div>

            {/* 바디 영역: w-350 고정 */}
            <div className="w-[350px] h-screen bg-white">
              {children}
            </div>
          </div>
        </AppRouterCacheProvider> 
      </body>
    </html>
  );
}

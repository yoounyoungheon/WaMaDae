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
            <div className="flex flex-row justify-between gap-3 bg-white px-5 py-3 font-bold text-xl items-center ">
              <div className="flex flex-row items-center gap-3"> 
                <p>🍷</p>
                <p>MySom</p>
              </div>

              <ShareOutlinedIcon />
            </div>
            {children}
          </div>
        </AppRouterCacheProvider> 
      </body>
    </html>
  );
}

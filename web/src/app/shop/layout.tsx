import { ShopDrawer } from "./component/drawer";

export default function ShopRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return(
    <div>
      <ShopDrawer/>
      {children}
    </div>
  )
}
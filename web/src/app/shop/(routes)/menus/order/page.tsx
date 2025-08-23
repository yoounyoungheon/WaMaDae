import { getShopMenus } from "@/app/business/shop/service/menu.service";
import { ShopHeader } from "@/app/shop/component/header";
import ManageMenuOrderComponent from "../component/manage-menu-order-component";

export default async function Page() {
  const menus = await getShopMenus(1)

  return (
    <div className="flex flex-col">
      <ShopHeader headerTitle={"메뉴순서 변경"} />
      
      {typeof menus !== 'undefined' 
        && <ManageMenuOrderComponent menusResponse={menus}/>}
    </div >
  )
}
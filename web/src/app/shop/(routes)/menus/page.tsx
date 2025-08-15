import { ShopHeader } from "../../component/header";
import RoutingSwitcher from "../../component/switcher";
import { ShopMenus } from "./component/shop-menus";

export default function Page({
    searchParams,
  }: {
    searchParams: { [key: string]: string | undefined }}) {
  const type = searchParams.type || "my-wine";

  return (
    <div className="flex flex-col">
      <ShopHeader headerTitle={"메뉴관리"} />

      <div className="flex flex-col justify-center items-center">
        <div className="py-4">
          <RoutingSwitcher values={[{name: "우리 가게 메뉴", value:"shop-menu"}, {name: "메뉴 추가", value:"create-menu"}]}/>
        </div>
        {type === "shop-menu" ? (
          <>
            <ShopMenus />
          </>
        ) : (
          <></>
        )}
      </div>
    </div>
  )
}
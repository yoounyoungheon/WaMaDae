import Link from "next/link";
import { ShopCarousel } from "./component/shop-carousel";

export default function Page() {
  const menuProps = [{name: '와인관리', routeUrl: '/shop/wines'}, {name: '메뉴관리', routeUrl: '/shop/menus'}, {name: '업장관리', routeUrl: '/shop/management'}];

  return (
    <div className="flex flex-col ">
      <div className="p-5">
        <ShopCarousel/>
      </div>
      
      <div className='pl-5'>
        <p className="pt-3 font-semibold">
            전체 메뉴
        </p>

        <div className="flex flex-row gap-5 pt-3">
        {menuProps.map((menu, index) => 
            <MenuCard key={index} menuName={menu.name} routeUrl={menu.routeUrl} />)}
        </div>
      </div>
    </div>
  )
}

function MenuCard({menuName, routeUrl}: {menuName: string, routeUrl: string}) {

  return (
    <Link href={routeUrl}>
      <div className="flex flex-col items-center gap-3">
        <div className="h-16 w-16 rounded-full bg-mysom-secondary"/>
        <p className="text-xs">
          {menuName}
        </p>
      </div>
    </Link>
  )

}
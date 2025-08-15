import { getShopMenus } from "@/app/business/shop/service/menu.service";
import { MenuViewModel } from "@/app/business/shop/view-model/menu-view-model";
import Button from "@/app/ui/atom/button";
import { cn } from "@/app/utils/style/helper";
import Image from "next/image";

export const ShopMenus = async () => {
  const menus = await getShopMenus(1)

  return(
    <>
      <div className="flex flex-col gap-2 w-full px-4">
        {menus.map((menu)=>{
          return <MenuInfoCard key={menu.id} menu={menu}/>
        })}
      </div>
    </>
  )
}

const MenuInfoCard = ({menu}:{menu: MenuViewModel}) => {
  return (
    <label className="block cursor-pointer border shadow-md rounded-lg transition" >
        <input 
          type="checkbox"
          name="menu"
          className="hidden peer"
        />
        <div
          className={cn(
          "p-2",
          "peer-checked:border-mysom-primary peer-checked:border-2 peer-checked:rounded-lg ",)}
          >
          <div className="grid grid-cols-[2fr_10fr] items-center gap-3">
            <div className="rounded-full w-20 h-20 relative overflow-hidden border border-mysom-lightgray">
              <Image
                alt="메뉴 이미지를 불러오지 못했습니다."
                src={menu.imageUrl}
                fill
                className="object-cover"
              />
              </div>
              <div className="flex flex-col flex-grow gap-1">
              <div className="font-semibold">{menu.name}</div>
              </div>
          </div> 
        </div>
  
        <div className="hidden peer-checked:block p-2 px-4 mt-2">
          <div className="flex flex-col gap-1">
            <div className="grid grid-cols-[3fr_10fr] gap-1 text-mysom-darkgray" style={{ fontSize: '12px' }}> <p className="w-14">메뉴명</p> {menu.name}</div>
            <div className="grid grid-cols-[3fr_10fr] gap-1 text-mysom-darkgray" style={{ fontSize: '12px' }}> <p className="w-14">가격</p>  {menu.price}</div>
            <div className="grid grid-cols-[3fr_10fr] gap-1 text-mysom-darkgray" style={{ fontSize: '12px' }}> <p className="w-14">카테고리</p>  <div className="flex flex-row gap-1">{menu.category.map((val, index) => (<p key={index}>{`${val}, `}</p>))}</div></div>
            <div className="grid grid-cols-[3fr_10fr] gap-1 text-mysom-darkgray" style={{ fontSize: '12px' }}> <p className="w-14">메뉴 설명</p>  {menu.description}</div>
            <div className="flex flex-row gap-1 justify-end mb-3 mt-3">
              <Button style={{ fontSize: '10px' }}>{"수정"}</Button>
              <Button variant='secondary' style={{ fontSize: '10px' }}>{"삭제"}</Button>
            </div>
          </div>
        </div> 
    </label>
  )
}
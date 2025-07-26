import { ShopCarousel } from "./component/shop-carousel";

export default function Page() {
  const menuName = ['와인관리', '메뉴관리', '업장관리'];

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
        {menuName.map((name, index) => 
            <MenuCard key={index} menuName={name} />)}
        </div>
      </div>
    </div>
  )
}

function MenuCard({menuName}: {menuName: string}) {

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="h-16 w-16 rounded-full bg-mysom-secondary"/>
      <p className="text-xs">
        {menuName}
      </p>
    </div>
  )

}
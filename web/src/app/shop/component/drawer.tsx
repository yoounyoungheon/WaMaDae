import Link from "next/link"
import MenuIcon from '@mui/icons-material/Menu';

export const ShopDrawer = () => {
  return (
    <div className="relative">
      <label className="absolute cursor-pointer z-50">
        <input 
          type="checkbox"
          name="menu"
          className="hidden peer"
        />
        <div className="p-3">
          <MenuIcon className="text-black w-8 h-8"/>
        </div>

        <div className="hidden peer-checked:block shadow-lg mt-2">
          <div className="bg-white h-screen flex flex-col w-[200px]">
            <Link href={'/shop'}>
              <div className="px-4 py-2">
                나의 업장
              </div>
            </Link>
            <Link href={'/shop/wines'}>
              <div className="px-4 py-2">
                와인 관리
              </div>
            </Link>
            <Link href={'/shop/menus'}>
              <div className="px-4 py-2">
                메뉴 관리
              </div>
            </Link>
          </div>
        </div>

      </label>
    </div>
  )
}
  
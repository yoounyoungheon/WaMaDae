import Link from "next/link";
import { ShopCarousel } from "./component/shop-carousel";
import { ShopHeader } from "./component/header";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";

export default function Page() {
  const menuProps = [{name: '와인 관리하기', routeUrl: '/shop/wines'}, {name: '메뉴 관리하기', routeUrl: '/shop/menus'}];
  const headerTtile = "MYSOMM"
  return (
    <div className="flex flex-col bg-mysom-background">
      {/* 상단 배너 영역 */}
      <ShopHeader headerTitle={headerTtile}/>
      
      <div className='flex flex-row justify-between font-semibold px-5 pt-5 pb-3 shadow-md bg-white'>
        <div className="flex flex-row gap-2">
          <p>{`홍길동 님, `}</p>
          <Chip title="오린트 성수" />
        </div>
        <div className="flex items-center">
          <NotificationsOutlinedIcon sx={{ fontSize: 24 }} />
        </div>
      </div>

      <div className='px-5 pt-5 min-h-screen h-auto'>
        <div className="grid grid-cols-2 gap-2 pb-5">
          <ShopManagementCard routeUrl="/shop/management"/>

          <div className="flex flex-col gap-2">
            {menuProps.map((menu, index) => 
            <MenuCard key={index} menuName={menu.name} routeUrl={menu.routeUrl} />)}
          </div>
        </div>
        <ShopCarousel/>
      </div>
    </div>
  )
}

const ShopManagementCard = ({routeUrl}: {routeUrl: string}) => 
  <Link href={routeUrl}>
    <Card className="h-full" sx={{ boxShadow: 3 }}>
      <CardContent className="flex flex-col gap-1 justify-items-center h-full">
        <div className="text-start font-semibold">{`업장 관리하기`}</div>
        <div className="text-start text-mysom-primary text-xs font-thin">{`내 가게 정보를 관리할 수 있어요.`}</div>
      </CardContent>
    </Card>
  </Link>


const MenuCard = ({menuName, routeUrl}: {menuName: string, routeUrl: string}) => 
  <Link href={routeUrl}>
    <Card  sx={{ boxShadow: 3 }}> 
      <CardContent className="flex flex-col gap-1 justify-items-center bg-gradient-to-b from-mysom-purple to-mysom-lightpurple">
        <div className="text-start text-white text-xs font-thin">{`우리 매장에 있는`}</div>
        <div className="text-start text-white font-semibold">{menuName}</div>
      </CardContent>
    </Card>
  </Link>
  
const Chip = ({title}:{title: string}) => 
  <div className="rounded-md bg-mysom-secondary text-mysom-primary p-1 max-w-56 text-center text-[10px]">
    {title}
  </div>
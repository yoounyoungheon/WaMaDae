import { cn } from "@/app/utils/style/helper";
import Image from "next/image";

export const ShopMenus = () => {
  return(
    <>
      <div className="flex flex-col gap-2 w-full px-4">
        <MenuInfoCard />
        <MenuInfoCard />
      </div>
    </>
  )
}

const MenuInfoCard = () => {
  return (
    <label className="block cursor-pointer border shadow-none rounded-lg transition" >
        <input 
          type="radio"
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
                alt="와인 이미지를 불러오지 못했습니다."
                src=""
                fill
                className="object-cover"
              />
              </div>
              <div className="flex flex-col flex-grow gap-1">
              <div className="font-semibold">{'가자 가자 라구 파스타'}</div>
              </div>
          </div> 
        </div>
  
        <div className="hidden peer-checked:block p-2 px-4 mt-2">
          <div className="grid grid-cols-[3fr_10fr] gap-1 text-mysom-darkgray" style={{ fontSize: '10px' }}> <p className="w-14">메뉴명</p> {`가자 라구 파스타`}</div>
          <div className="grid grid-cols-[3fr_10fr] gap-1 text-mysom-darkgray" style={{ fontSize: '10px' }}> <p className="w-14">가격</p>  {`1,5000 원`}</div>
          <div className="grid grid-cols-[3fr_10fr] gap-1 text-mysom-darkgray" style={{ fontSize: '10px' }}> <p className="w-14">카테고리</p>  {`파스타, 인기, 추천`}</div>
          <div className="grid grid-cols-[3fr_10fr] gap-1 text-mysom-darkgray" style={{ fontSize: '10px' }}> <p className="w-14">메뉴 설명</p>  {`가자고 가자고 가자고 가자고가자고 가자고 가자고 가자고 가자고 가자고 가자고 가자고`}</div>
        </div> 
    </label>
  )
}
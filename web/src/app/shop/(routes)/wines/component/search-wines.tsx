'use client'

import { useRef, useState } from "react";
import SearchIcon from '@mui/icons-material/Search';
import { cn } from "@/app/utils/style/helper";
import Image from "next/image";
import { ShopSearchWineViewModel } from "@/app/business/wine/view-model/shop-wine-view-model";
import Button from "@/app/ui/atom/button";
import Divider from "@mui/material/Divider";
import { useSearchShopWines } from "@/app/business/wine/hook/shop-wine-search-hook";


export const SearchWines = ({shopId}: {shopId: number}) => {
  const serchInputRef = useRef<HTMLInputElement>(null);
  const [searchParam, setSearchParam] = useState<string>("");
  const {shopWinesViewModels, callApi} = useSearchShopWines({ searchParam, shopId, page: 1, size: 10 });
  const onClickSearchButton = () => {
    if(!serchInputRef.current?.value) return
    setSearchParam(serchInputRef.current?.value || "")
    callApi()
  }

  return (
    <div className="flex flex-col w-full h-full px-4">
      
      <div className="flex flex-row gap-1 w-full justify-center items-center">
        <input className='focus:outline-none' ref={serchInputRef}/>
        <SearchButton onClick={onClickSearchButton}/>
      </div>

      <div className="flex w-full justify-center items-center px-12 mt-2">
        <Divider className="w-full" style={{ backgroundColor: 'black' }} />
      </div>
      

      {shopWinesViewModels.length === 0 || searchParam.length === 0 ? <></> : <>
        <div className="text-start text-sm mb-3 mt-5">{`"${searchParam}" 검색어는 총 ${shopWinesViewModels.length}종입니다.`}</div>
        <div className="flex flex-col gap-2">
          {shopWinesViewModels.map((wine) => (
            <div key={wine.id}>
                <WineInfoCard key={wine.id} wine={wine}/>
            </div>
          ))} 
        </div>
      </>}
    </div>
  )
}

const SearchButton = ({onClick}:{onClick: ()=>void}) => {

  return (
    <button onClick={onClick}>
      <SearchIcon/>
    </button>
  )
}

const WineInfoCard = ({wine}:{wine: ShopSearchWineViewModel}) => {
  return (
    <label className="block cursor-pointer border rounded-lg transition" >
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
                alt="와인 이미지를 불러오지 못했습니다."
                src={wine.image}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col flex-grow gap-1">
              <div className="text font-semibold">{wine.name}</div>
              <div className="text-xs text-mysom-darkgray">{wine.description}</div>
            </div>
          </div> 
        </div>
  
        <div className="hidden peer-checked:block p-2 px-4 mt-2">
          <div className="text-sm font-semibold py-2">{wine.commentOfMySom}</div>
          <div className="flex flex-row gap-1 text-mysom-darkgray" style={{ fontSize: '10px' }}> <p className="w-8">향, 맛</p> {wine.taseInfo.map((val, index) => (<p key={index}>{`${val}, `}</p>))}</div>
          <div className="flex flex-row gap-1 text-mysom-darkgray" style={{ fontSize: '10px' }}> <p className="w-8">품종</p>  {wine.variety}</div>
          <ScaleInfo label="당도" scale={wine.sweetness} />
          <ScaleInfo label="바디감" scale={wine.body} />
          <ScaleInfo label="타닌" scale={wine.tannin} />
          <ScaleInfo label="산도" scale={wine.acidity} />
          <div className="text-end mb-3">
            {<Button style={{ fontSize: '10px' }}>{wine.isMine ?"이미 존재하는 와인입니다.":"우리 업장에 추가하기"}</Button>}
          </div>
        </div> 
    </label>
  )
}


const ScaleInfo = ({label, scale}: {label:string, scale: number}) => {
  return (
    <div className="flex flex-row gap-1 text-mysom-darkgray" style={{ fontSize: '10px' }}>
      <p className="w-8">{label}</p>
      
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="flex items-center">
            <div className={`w-2 h-2 rounded-full ${index < scale ? "bg-mysom-primary" : "bg-mysom-secondary"}`}/>
        </div>
      ))}
    </div>
  )
}
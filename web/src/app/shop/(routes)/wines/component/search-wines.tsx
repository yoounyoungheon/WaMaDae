'use client'

import TextInput from "@/app/ui/atom/text-input";
import { useRef, useState } from "react";
import SearchIcon from '@mui/icons-material/Search';
import { useShopWineSearch } from "@/app/business/wine/hook/shop-wine-hook";
import { Card } from "@/app/ui/molecule/card";
import { cn } from "@/app/utils/style/helper";
import Grid from "@mui/material/Grid";
import Image from "next/image";
import { ShopSearchWineViewModel } from "@/app/business/wine/view-model/shop-wine-view-model";
import Link from "next/link";
import Button from "@/app/ui/atom/button";

interface AllWinesProps {
  shopId: number;
  selectedWineId?: number;
}

export const SearchWines = ({shopId, selectedWineId}: AllWinesProps) => {
  const serchInputRef = useRef<HTMLInputElement>(null);
  const [searchParam, setSearchParam] = useState<string>("");
  const wines = useShopWineSearch({ searchParam });

  return (
    <div className="flex flex-col w-full px-4">
      <div className="flex flex-row gap-1 w-full justify-center items-center">
        <TextInput ref={serchInputRef}/>
        <SearchButton onClick={()=>setSearchParam(serchInputRef.current?.value || "")}/>
      </div>

      {wines.length === 0 || searchParam.length === 0 ? <></> : <>
        <div className="text-start text-sm mb-3 mt-5">{`"${searchParam}" 검색어는 총 ${wines.length}종입니다.`}</div>
        <div className="flex flex-col gap-2">
          {wines.map((wine) => (
            <div key={wine.id}>
            {
              selectedWineId === wine.id ? (
                <SelectedWineInfoCard key={wine.id} wine={wine} shopId={shopId}/>
              ) : (
                <WineInfoCard key={wine.id} wine={wine} isSelected={false}/>
              )
            }
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

const WineInfoCard = ({wine, isSelected}: {wine: ShopSearchWineViewModel, isSelected: boolean}) => {

  return (
    <Link href={`/shop/wines?list=all-wine&wine=${wine.id}`}>
    <Card key={wine.id} className={cn("p-2 border shadow-none rounded-lg", isSelected ? "border-mysom-primary border-2" : "border-mysom-lightgray")}>
      <Grid sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
        <div className="rounded-full w-20 h-20 relative overflow-hidden border border-mysom-lightgray">
          <Image alt="와인 이미지를 불러오지 못했습니다." src={wine.image} fill className="object-cover"/>
        </div>
        <Grid sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, gap: 1 }}>
          <div className="text font-semibold">{wine.name}</div>
          <div className="text-xs text-mysom-darkgray">{wine.description}</div>
        </Grid>
      </Grid>
    </Card> 
    </Link>

  )
}

const SelectedWineInfoCard = ({wine, shopId}: {wine: ShopSearchWineViewModel, shopId: number}) => {
  // TODO: 추후 shopId를 이용해서 와인 추가 요청을 보낼 수 있음
  console.log(shopId);

  return (
    <Card className="rounded-lg shadow-lg border-none">

      {WineInfoCard({wine, isSelected: true})}

      {/* 선택한 와인에 대한 추가 데이터 */}
      <div className="flex flex-col gap-1 p-2 px-4">
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
    </Card>
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
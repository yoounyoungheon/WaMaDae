'use client'

import TextInput from "@/app/ui/atom/text-input";
import { useRef } from "react";
import SearchIcon from '@mui/icons-material/Search';
import { useShopWineSearch } from "@/app/business/wine/hook/shop-wine-hook";

export const SearchWines = () => {
  const serchInputRef = useRef<HTMLInputElement>(null);
  const wines = serchInputRef.current === null ? [] : useShopWineSearch({searchParams: serchInputRef.current?.value || ""});

  return (
    <>
      <div className="flex flex-row gap-1">
        <TextInput ref={serchInputRef}/>
        <SearchButton onClick={()=>alert("검색 시도")}/>
      </div>
      {wines.length === 0 ? <></>:<></>}
    </>
  )
}

const SearchButton = ({onClick}:{onClick: ()=>void}) => { 
  return (
    <button onClick={onClick}>
      <SearchIcon/>
    </button>
  )
}
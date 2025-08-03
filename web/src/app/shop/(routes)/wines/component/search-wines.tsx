'use client'

import TextInput from "@/app/ui/atom/text-input";
import { useRef } from "react";
import SearchIcon from '@mui/icons-material/Search';

export const SearchWines = () => {
  const serchInputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <div className="flex flex-row gap-1">
        <TextInput/>
        <SearchButton onClick={()=>alert("검색 시도")}/>
      </div>
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
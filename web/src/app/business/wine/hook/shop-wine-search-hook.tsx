'use client'

import { useEffect, useState } from "react";
import { createShopSearchWineViewModel, ShopSearchWineViewModel } from "../view-model/shop-wine-view-model";

// 업장에서 사용하는 와인 검색 hook
export const useSearchShopWines = ({searchParam, shopId, page, size}:{searchParam: string, shopId: number, page: number, size:number}) => {
  const [shopWinesViewModels, setShopWinesViewModels] = useState<ShopSearchWineViewModel[]>([]);
  
  useEffect(() => {
    console.log(shopId)
    setShopWinesViewModels(mockShopWinesViewModels)
    
  }, [searchParam, page, size, shopId]);

  return shopWinesViewModels
}
  
// mock 데이터 (서비스에서 받아오는 데이터로 대체해야함)
const mockShopWinesViewModels: ShopSearchWineViewModel[] = [
  createShopSearchWineViewModel(
    5,
    ["Fruity", "Crisp"],
    "소비뇨 블랑",
    "Chardonnay",
    "상큼하고 부드러운 맛이 일품입니다.",
    3,
    4,
    2,
    3,
    "/carrot1.png",
    "깔끔하고 괜찮은 와인.",
    false
  ),
  createShopSearchWineViewModel(
    10,
    ["Fruity", "Crisp"],
    "소비뇨 블랑 레몬",
    "Merlot",
    "진한 과일 향과 부드러운 타닌이 특징입니다.",
    4,
    5,
    3,
    4,
    "/carrot2.jpeg",
    "당도가 괜찮은 와인.",
    true
  ),
];
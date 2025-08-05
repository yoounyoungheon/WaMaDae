import { createShopSearchWineViewModel, createShopWineViewModel, ShopSearchWineViewModel } from "../view-model/shop-wine-view-model";
import { getShopWineList } from "../service/shop-wine-service";

// 업장에서 사용하는 와인 데이터를 처리하는 hook
export const getShopMyWineViewModels = async ({shopId}:{shopId:  number}) => {
  const wineModels = (await getShopWineList(shopId)).data;
  
  const shopWinesViewModels = wineModels?.data.map(wine => 
    createShopWineViewModel(
      wine.id,
      ["mock tatse info"],
      wine.name,
      wine.variety,
      'mock mysom description',
      wine.sweetness,
      wine.body,
      wine.tannin,
      wine.acidity,
      "/carrot2.jpeg", // wine.image || "",
      wine.description || null
    )
  ) || [];

  console.log("Shop wines view models created:", shopWinesViewModels);
  return shopWinesViewModels;
}

// 업장에서 사용하는 와인 검색 hook
export const useShopWineSearch = ({searchParam}:{searchParam: string}) => {
  console.log("와인 검색어:", searchParam);
  
  // mock 데이터 (서비스에서 받아오는 데이터로 대체해야함)
  const shopWinesViewModels: ShopSearchWineViewModel[] = [
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

  return shopWinesViewModels;
}
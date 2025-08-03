import { createShopWineViewModel, ShopWineViewModel } from "../view-model/shop-wine-view-model";

// 업장에서 사용하는 와인 데이터를 처리하는 hook
export const useShopMyWines = ({shopId}:{shopId:  number}) => {
  console.log("useShopMyWines called with shopId:", shopId);

  // mock 데이터 (서비스에서 받아오는 데이터로 대체해야함)
  const shopWinesViewModels: ShopWineViewModel[] = [
    createShopWineViewModel(
      1,
      ["Fruity", "Crisp"],
      "Chardonnay",
      "Chardonnay",
      "상큼하고 부드러운 맛이 일품입니다.",
      3,
      4,
      2,
      3,
      "/carrot1.png",
      "깔끔하고 괜찮은 와인.",
    ),
    createShopWineViewModel(
      2,
      ["Fruity", "Crisp"],
      "Merlot",
      "Merlot",
      "진한 과일 향과 부드러운 타닌이 특징입니다.",
      4,
      5,
      3,
      4,
      "/carrot2.jpeg",
      "당도가 괜찮은 와인.",
    ),
  ];

  return shopWinesViewModels;
}

export const useShopWineSearch = ({searchParams}:{searchParams: string}) => {
  console.log("와인 검색어:", searchParams);
  
  // mock 데이터 (서비스에서 받아오는 데이터로 대체해야함)
  const shopWinesViewModels: ShopWineViewModel[] = [
    createShopWineViewModel(
      1,
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
    ),
    createShopWineViewModel(
      2,
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
    ),
  ];

  return shopWinesViewModels;
}
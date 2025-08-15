import { createShopWineViewModel } from "../view-model/shop-wine-view-model";
import { getShopWines } from "../service/shop-wine-service";

// 업장에서 사용하는 와인 데이터를 처리하는 함수
export const getShopMyWineViewModels = async ({shopId, page, size}:{shopId:  number, page: number, size:number}) => {
  const wineModels = (await getShopWines(shopId, page, size)).data;

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
      "/carrot2.jpeg",
      wine.description || null
    )
  ) || [];

  return shopWinesViewModels;
}
import { getShopMyWineViewModels } from "@/app/business/wine/hook/shop-wine-hook";
import { cn } from "@/app/utils/style/helper";
import Image from "next/image";
import { DeleteWineButton } from "./delete-wine-button";
import { ShopWineViewModel } from "@/app/business/wine/view-model/shop-wine-view-model";


export const MyWines = async ({shopId}:{shopId: number}) => {
  const wineViewModels = await getShopMyWineViewModels({ shopId, page: 1, size: 10 });

  return (
    <>
      <div className="font-semibold mb-5">{`현재 등록된 와인은 총 ${wineViewModels.length}종입니다.`}</div>
      <div className="flex flex-col gap-2 w-full px-4">
        {wineViewModels.map((wine: ShopWineViewModel) => 
          <WineInfoCard key={wine.id} wine={wine}/>
        )}
      </div>
    </>
  )
}

const WineInfoCard = ({wine}:{wine: ShopWineViewModel}) => {
  return (
    <label className="block cursor-pointer border shadow-none rounded-lg transition" >
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
          <DeleteWineButton wineId={wine.id} shopId={0}/>
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
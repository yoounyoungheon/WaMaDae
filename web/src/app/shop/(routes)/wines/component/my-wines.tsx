import { getShopMyWineViewModels } from "@/app/business/wine/hook/shop-wine-hook";
import { Card } from "@/app/ui/molecule/card";
import { cn } from "@/app/utils/style/helper";
import Grid from "@mui/material/Grid";
import Image from "next/image";
import Link from "next/link";
import { DeleteWineButton } from "./delete-wine-button";
import { ShopWineViewModel } from "@/app/business/wine/view-model/shop-wine-view-model";

interface MyWinesProps {
  shopId: number;
  selectedWineId?: number;
}

export const MyWines = async ({shopId, selectedWineId}: MyWinesProps) => {
  const wineViewModels = await getShopMyWineViewModels({ shopId });

  return (
    <>
      <div className="font-semibold mb-5">{`현재 등록된 와인은 총 ${wineViewModels.length}종입니다.`}</div>
      <div className="flex flex-col gap-2 w-full px-4">
        {wineViewModels.map((wine: ShopWineViewModel) => (
          selectedWineId === wine.id ? (
            <SelectedWineInfoCard key={wine.id} wine={wine} shopId={shopId}/>
          ) : (
            <WineInfoCard key={wine.id} wine={wine} isSelected={false}/>
          )
        ))}
      </div>
    </>
  )
}

export const WineInfoCard = ({wine, isSelected}: {wine: ShopWineViewModel, isSelected: boolean}) => {
  return (
    <Link href={`/shop/wines?list=my-wine&wine=${wine.id}`}>
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

export const SelectedWineInfoCard = ({wine, shopId}: {wine: ShopWineViewModel, shopId: number}) => {
  
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
          <DeleteWineButton wineId={wine.id} shopId={shopId} />
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
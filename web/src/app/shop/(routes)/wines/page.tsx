import { ShopHeader } from "../../component/header";
import RoutingSwitcher from "../../component/switcher";
import { SearchWines } from "./component/search-wines";
import { MyWines } from "./component/my-wines";


export default function Page({
    searchParams,
  }: {
    searchParams: { [key: string]: string | undefined }}) {
  const type = searchParams.type || "my-wine";

  return (
    <div className="flex flex-col">
      <ShopHeader headerTitle={"와인관리"} />

      <div className="flex flex-col justify-center items-center">
        <div className="py-4">
          <RoutingSwitcher values={[{ name: "우리 매장 와인", value: "my-wine" }, { name: "전체 와인 리스트", value: "all-wine" }]} query={"type"}/>
        </div>
        
        {type === "my-wine" ? (
          <MyWines shopId={1} />
        ) : (
          <SearchWines shopId={1} />
        )}
      </div>
    </div>
  )
}
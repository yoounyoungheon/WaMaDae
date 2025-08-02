import { ShopHeader } from "../../component/header";
import ShopSwitcher from "../../component/switcher";

export default function Page() {
  return (
    <div className="flex flex-col">
      <ShopHeader headerTitle={"와인관리"} />
      <div className="flex justify-center items-center">
        <div className="py-4">
          <ShopSwitcher values={[{name: "전체 와인 리스트", value:"all-wine"}, {name: "우리 매장 와인", value:"my-wine"}]}/>
        </div>
        
      </div>
    </div>
  )
}
import { ShopHeader } from "../../component/header";
import BasicSwitches from "../../component/switcher";

export default function Page() {
  return (
    <div className="flex flex-col">
      <ShopHeader headerTitle={"와인관리"} />
      <div className="flex justify-center items-center">
        <div className="py-4">
          <BasicSwitches/>
        </div>
        
      </div>
    </div>
  )
}
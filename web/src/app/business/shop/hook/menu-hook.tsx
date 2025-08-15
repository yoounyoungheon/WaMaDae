import { useEffect, useState } from "react"
import { getShopMenus } from "../service/menu.service"
import { MenuViewModel } from "../view-model/menu-view-model"

export const useShopMenus = ({shopId}:{shopId: number}) => {
  const [menus, setMenus] = useState<MenuViewModel[]>([])
 
  useEffect(()=>{
    getShopMenus(shopId).then((menus)=>{
      setMenus(menus)  
    })
  }, [shopId])

  return {
    menus,
    setMenus
  }
}
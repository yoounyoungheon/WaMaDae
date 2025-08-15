'use client'
import { useShopMenus } from "@/app/business/shop/hook/menu-hook";
import { ShopHeader } from "@/app/shop/component/header";
import Button from "@/app/ui/atom/button";
import { useRouter } from "next/navigation";
import { Suspense, useRef } from "react";
import Image from "next/image";

export default function Page() {
  const { menus, setMenus } = useShopMenus({shopId: 1})
  const dragItemIndex = useRef<number | null>(null);
  const dragOverItemIndex = useRef<number | null>(null);
  const router  = useRouter()

  const handleDragStart = (index: number) => {
    dragItemIndex.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverItemIndex.current = index;
  };

  const handleDragEnd = () => {
    const startIndex = dragItemIndex.current;
    const endIndex = dragOverItemIndex.current;

    if (startIndex !== null && endIndex !== null && startIndex !== endIndex) {
      const updatedItems = [...menus];
      const [movedItem] = updatedItems.splice(startIndex, 1);
      updatedItems.splice(endIndex, 0, movedItem);

      const reSequenced = updatedItems.map((item, idx) => ({
        ...item,
        sequence: idx + 1,
      }));

      setMenus(reSequenced);
    }

    dragItemIndex.current = null;
    dragOverItemIndex.current = null;
  };

  return (
    <Suspense>
      <div className="flex flex-col">
        <ShopHeader headerTitle={"메뉴순서 변경"} />

        <div className="space-y-2 p-2">
          <div className="text-end">
            <Button variant={'ghost'} onClick={()=>router.back()}>save</Button>
          </div>

          <ul className="space-y-4">
            {menus.map((menu, index) => (
              <li
                key={menu.sequenceNumber}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragEnd={handleDragEnd}
                className="p-3 bg-white rounded shadow cursor-grab hover:bg-gray-100 transition flex justify-between"
              >
                <div className="grid grid-cols-[2fr_10fr] items-center gap-3">
                  <div className="rounded-full w-14 h-14 relative overflow-hidden border border-mysom-lightgray">
                    <Image
                        alt="메뉴 이미지를 불러오지 못했습니다."
                        src={menu.imageUrl}
                        fill
                        className="object-cover"
                    />
                  </div>
                  <div className="flex flex-row justify-between">
                    <div className="font-semibold">{menu.name}</div>
                    <div className="px-3 font-semibold text-mysom-darkgray">{`#${menu.sequenceNumber}`}</div>
                  </div>
                </div> 
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Suspense>
  )
}
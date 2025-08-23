'use client'
import Button from "@/app/ui/atom/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MenuViewModel } from "@/app/business/shop/view-model/menu-view-model";
import { DragEndEvent } from "@dnd-kit/core";
import { useState } from "react";


export default function ManageMenuOrderComponent({menusResponse}:{menusResponse: MenuViewModel[]}) {
  const [menus, setMenus] = useState<MenuViewModel[]>(menusResponse)

  const router  = useRouter()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      setMenus((prev) => {
        const oldIndex = prev.findIndex((menu) => menu.id === active.id);
        const newIndex = prev.findIndex((menu) => menu.id === over.id);
        const reordered = arrayMove(prev, oldIndex, newIndex);

        return reordered.map((item, idx) => ({
          ...item,
          sequenceNumber: idx + 1,
        }));
      });
    }
  };

  return (
    <div className="space-y-2 p-2">
      <div className="text-end">
        <Button variant={'ghost'} onClick={()=>router.back()}>save</Button>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={menus.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {menus.map((menu)=><DraggableMenuInfoCard key={menu.id} menu={menu}/>)}
        </SortableContext>
      </DndContext>
    </div>
  )
}

const DraggableMenuInfoCard = ({menu}:{menu: MenuViewModel}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: menu.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
  <div
    ref={setNodeRef}
    style={style}
    {...attributes}
    {...listeners}
    className="p-3 bg-white rounded shadow cursor-grab hover:bg-gray-100 transition flex justify-between"
  >
    <div className="grid grid-cols-[2fr_10fr] items-center gap-3 select-none">
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
  </div>
  )
}
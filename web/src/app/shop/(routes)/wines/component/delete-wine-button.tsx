'use client';

import Button from "@/app/ui/atom/button";

export const DeleteWineButton = ({ wineId, shopId }: { wineId: number; shopId: number }) => {

  return (
    <Button variant={'destructive'} onClick={()=>alert(`와인 데이터 삭제! shop id: ${shopId}, wine id:${wineId}`)} style={{ fontSize: '10px' }}>
      삭제
    </Button>
  );
};
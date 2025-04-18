'use client'
import { updateBookFeeStatus } from "@/app/business/book/book.service";
import Button from "../../atom/button";

export function UpdateBookFeeStatusButton({bookId}:{bookId: string}){
  const setIsPaid = async () => {
    if(typeof bookId === 'undefined') return;

    const response = await updateBookFeeStatus(bookId);
    if(response.isSuccess){
      window.location.reload();
    } else{
      alert('변경하지 못했습니다. 다시 시도해주세요.')
    }
  }
  return (
    <Button onClick={setIsPaid}>
      결제 상태 변경
    </Button>
  )
}
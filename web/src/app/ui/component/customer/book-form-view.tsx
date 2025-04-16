'use client'
import { useRef } from "react";
import { Card } from "../../molecule/card";
import { Meeting } from "@/app/business/meeting/meeting.domain";
import TextInput from "../../atom/text-input";
import Button from "../../atom/button";
import { createBookRequest } from "@/app/business/book/book.service";
import { useRouter } from "next/navigation";

interface BookFormViewProps {
  meeting: Meeting
}

export function BookFormView ({meeting}:BookFormViewProps){
  const nameInputRef = useRef<HTMLInputElement>(null);
  const nickNameInputRef = useRef<HTMLInputElement>(null);
  const phoneNumberInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const meetingId = meeting.id;

  const handleCreateBook = async () => {
    console.log('action')
    if(
      (typeof nameInputRef.current?.value !== 'undefined')&&
      (typeof nickNameInputRef.current?.value !== 'undefined')&&
      (typeof phoneNumberInputRef.current?.value !== 'undefined')
    ) {
      createBookRequest(
        meetingId, 
        nameInputRef.current?.value, 
        nickNameInputRef.current?.value, 
        phoneNumberInputRef.current?.value
      ).then((res)=>{
        console.log(res)
        if(res.isSuccess){router.push('/customer/complete')}
      })
    }
  }
  return (
    <main>
      <Card className="p-3 space-y-3 text-sm text-sky-700 font-semibold">
        <div className="space-y-1">
          <span>
            이름
          </span>
          <TextInput placeholder="이름을 적어주세요." ref={nameInputRef}/>
        </div>
        <div className="space-y-1">
          <span>
            닉네임
          </span>
          <TextInput placeholder="와인캠퍼스에서 사용하는 닉네임을 적어주세요." ref={nickNameInputRef}/>
        </div>
        <div className="space-y-1">
          <span>
            전화번호
          </span>
          <TextInput placeholder="공지 메세지를 드리는 용도입니다." ref={phoneNumberInputRef}/>
        </div>
        <div className="text-center py-3">
          <Button onClick={handleCreateBook}>신청하기</Button>
        </div>
      </Card>
    </main>
  )
}
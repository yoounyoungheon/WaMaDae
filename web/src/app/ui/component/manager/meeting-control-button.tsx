'use client'

import { removeMeeting } from "@/app/business/meeting/meeting.service"
import Button from "../../atom/button"

export function RemoveMeetingButton({id}:{id: string}) {
  return (
    <Button variant={'ghost'} onClick={async()=>{
      removeMeeting(id).then((res)=>{
        if(res.isSuccess){
          window.location.reload();
        }
      })}
    }>삭제</Button>
  )
}
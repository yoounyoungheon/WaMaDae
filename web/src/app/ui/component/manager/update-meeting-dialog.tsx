import { Meeting } from "@/app/business/meeting/meeting.domain"
import Button from "../../atom/button"
import { Dialog, DialogContent, DialogTrigger } from "../../molecule/dialog"
import { UpdateMeetingForm } from "./update-meeting-form"


export const UpdateMeetingDialog = ({ meeting }:{ meeting: Meeting }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={'ghost'}>수정</Button>  
      </DialogTrigger>
      <DialogContent>
        <UpdateMeetingForm meeting={meeting}/>
      </DialogContent>
    </Dialog>
  )
}
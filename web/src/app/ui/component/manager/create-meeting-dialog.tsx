import Button from "../../atom/button"
import { Dialog, DialogContent, DialogTrigger } from "../../molecule/dialog"
import { CreateMeetingForm } from "./create-meeting-form"


export const CreateMeetingDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>모임 추가</Button>  
      </DialogTrigger>
      <DialogContent>
        <CreateMeetingForm/>
      </DialogContent>
    </Dialog>
  )
}
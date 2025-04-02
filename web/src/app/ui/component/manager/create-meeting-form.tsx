'use client'

import { createMeetingReqest } from "@/app/business/meeting/meeting.service"
import { FormState } from "@/app/utils/type/type";
import { useEffect, useState } from "react";
import { useFormState } from "react-dom"
import { CardContent } from "../../molecule/card";
import TextInput from "../../atom/text-input";
import Button from "../../atom/button";
import FormSelect from "../../molecule/dropdown/form-select-index";

export const CreateMeetingForm = () => {
  const initialState: FormState = {
    isSuccess: false,
    isFailure: false,
    message: '',
    validationError: {},
  };
  const [selectdMeetingType, setSelectedMeetingType] = useState<string>('class');
  const [createMeetinfFormState, dispatch] = useFormState(createMeetingReqest, initialState);

  useEffect(()=>{
    console.log(createMeetinfFormState);
    if(createMeetinfFormState.isSuccess){
      alert('모임을 생성했습니다.')
    }
  }, [createMeetinfFormState])

  return (
    <CardContent>
      <form id="create-meeting-form" action={dispatch} className="grid grid-cols-1 gap-4">
        <FormSelect placeholder={"모임 종류"} name="sort" className="ring-gray-200 border-gray-300">
          <FormSelect.Item value="class" placeholder="클래스" onSelect={()=>{setSelectedMeetingType('class')}}/>
          <FormSelect.Item value="club" placeholder="모임" onSelect={()=>{setSelectedMeetingType('club')}}/>
        </FormSelect>
        <input type="hidden" value={selectdMeetingType}/>
        <input type="date" defaultValue={new Date().toISOString().split('T')[0]} name="date" form="create-meeting-form"/>
        <TextInput name="meetingName" form="create-meeting-form" placeholder="모임 이름을 입력해주세요."/>
        <textarea 
          className={`w-full rounded-lg border border-gray-300 p-3 resize-none ring-gray-200 focus:border-none focus:outline-none focus:ring-2 focus:ring-blue-200`}
          name="description"
          form="create-meeting-form" 
          placeholder="모임에 대한 설명을 입력해주세요."
        />
        <TextInput name="place" form="create-meeting-form" placeholder="모임 장소를 입력해주세요."/>
        <TextInput name="fee" form="create-meeting-form" placeholder="모임 비용을 입력해주세요."/>
        <input type="hidden" name="imgUrl" value={'www.example.com'} form="create-meeting-form" placeholder="모임 이름을 입력해주세요."/>
        <TextInput name="endTime" form="create-meeting-form" placeholder="모임 시작 시간을 입력해주세요."/>
        <TextInput name="startTime" form="create-meeting-form" placeholder="모임 종료 시간을 입력해주세요."/>
        <Button type="submit" form="create-meeting-form">생성</Button>
      </form>
    </CardContent>
  )
}
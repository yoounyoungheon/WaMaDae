'use client'

import { Card, CardContent, CardTitle } from "../../molecule/card";
import { FormState } from "@/app/utils/type/type";
import { useFormState } from "react-dom";
import { useEffect } from "react";
import TextInput from "../../atom/text-input";
import Button from "../../atom/button";
import { useRouter } from "next/navigation";
import { authenticate } from "@/app/business/auth/auth.service";

export function AdminLoginForm () {
  const initialState: FormState = {
    isSuccess: false,
    isFailure: false,
    message: '',
    validationError: {},
  };

  const router = useRouter();

  const [formState, dispatch] = useFormState(authenticate, initialState);

  useEffect(()=>{
    if (formState.isSuccess) {
      router.push('/manager');
    }
  },[formState, router])

  return (
    <main>
      <Card className="w-full">
        <CardTitle className="p-10 text-center">와마대 관리자 페이지입니다.</CardTitle>
          <form id="sign-in" action={dispatch}>
            <CardContent className="grid grid-cols-1 gap-5">
              <TextInput name="username" form="sign-in"/>
              <TextInput name="password" type="password" form="sign-in"/>
              <Button type="submit" form="sign-in">로그인</Button>
            </CardContent>
          </form>
      </Card>
    </main>
  )
}
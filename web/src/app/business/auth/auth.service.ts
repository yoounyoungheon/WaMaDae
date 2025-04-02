'use server'

import { API_PATH } from "@/app/utils/http/api-query";
import { FormState } from "@/app/utils/type/type";
import { AxiosError } from "axios";
import { cookies } from "next/headers";
import { z } from 'zod';
const LogInFormSchema = z.object({
  username: z.string(),
  password: z.string(),
});

type LogInRequestBody = z.infer<typeof LogInFormSchema>;

export async function authenticate(prevState: FormState, formData: FormData):Promise<FormState> {
    const validatedFields = LogInFormSchema.safeParse({
      username: formData.get("username") as string,
      password: formData.get("password") as string,
    });
    
    if (!validatedFields.success) {
      return {
        isSuccess: false,
        isFailure: true,
        validationError: validatedFields.error.flatten().fieldErrors,
        message: "양식에 맞춰 다시 입력해주세요.",
      };
    }
    
    const body: LogInRequestBody = { ...validatedFields.data };
    
    try{
      console.log(`${API_PATH}/auth/sign-in`)
      const response = await fetch(`${API_PATH}/auth/sign-in`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body)
      });
  
      const result = await response.json();
      console.log(result);
      cookies().set("token", result.accessToken, {
        secure: true,
        path: "/",
      });
    
      return {
        isSuccess: true,
        isFailure: false,
        validationError: {},
         message: "로그인에 성공했습니다.",
      };
    } catch(error){
      if(error instanceof Error && error instanceof AxiosError){
        return {
          isSuccess: false,
          isFailure: true,
          validationError: {},
          message: '아이디와 비밀번호가 맞지 않습니다.',
        };
      }else{
        return {
          isSuccess: false,
          isFailure: true,
          validationError: {},
          message: '아이디와 비밀번호가 맞지 않습니다.'
        }
      }
    }
  }
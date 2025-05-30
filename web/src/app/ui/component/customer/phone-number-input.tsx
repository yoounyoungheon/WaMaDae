'use client'

import { useRef } from "react";
import TextInput from "../../atom/text-input";
import Button from "../../atom/button";
import { useRouter } from "next/navigation";

export function PhoneNumberInput() {
  const phoneNumberInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleSubmit = () => {
    const phoneNumber = phoneNumberInputRef.current?.value;
    if (phoneNumber) {
      router.push(`/customer/my-book?phoneNumber=${phoneNumber}`);
    } else {
      alert("전화번호를 입력해주세요.");
    }
  };

  return (
    <main className="w-full px-5">
      <div className="py-3 text-sky-700 font-semibold">전화번호로 예약 확인하기</div>
      <div className="flex space-x-2 text-center">
        <TextInput ref={phoneNumberInputRef} placeholder="전화번호를 입력해주세요." />
        <Button onClick={handleSubmit}>입력</Button>
      </div>
    </main>
  );
}
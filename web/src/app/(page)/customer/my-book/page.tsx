import Image from "next/image";
import { PhoneNumberInput } from "@/app/ui/component/customer/phone-number-input";
import { APIResponseType } from "@/app/utils/http";
import { Book } from "@/app/business/book/book.domain";
import { loadBookByPhoneNumber } from "@/app/business/book/book.service";
import { BookInfo } from "@/app/ui/component/manager/bookInfo";
import Cattot1 from "@/app/assets/carrot1.png"

export default async function MyBookPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const phoneNumber = searchParams.phoneNumber;
  let loadBookByPhoneNumberResponse: APIResponseType<Book[]> | null = null;

  if(typeof phoneNumber !== 'undefined'){
    loadBookByPhoneNumberResponse = await loadBookByPhoneNumber(phoneNumber);
  }
  
  return (
    <main>
      <div className="relative w-full aspect-square mb-4">
        <Image src={Cattot1.src} alt={""} fill className="rounded-lg object-cover"/>
      </div>
      <div className="w-full mb-5">
      {typeof phoneNumber === 'undefined' || phoneNumber === ''?
        <div>
          <PhoneNumberInput/>
        </div>
        :
        <div className="p-3 space-y-3">
          {(loadBookByPhoneNumberResponse&&loadBookByPhoneNumberResponse.data)&&(
          loadBookByPhoneNumberResponse?.data.map((book, index)=>{
            return (<BookInfo key={index} book={book} isManager={false}/>)
        }))}
        </div>}
      </div>
    </main>
  )
}
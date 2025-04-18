import { Book } from "@/app/business/book/book.domain";
import { UpdateBookFeeStatusButton } from "./update-book-fee-status-button";

export function BookInfo({ book, isManager }: { book: Book, isManager: boolean }) {
  const { name, nickname, phoneNumber, isPaid, id } = book;

  return (
    <main className="p-5 bg-white rounded-lg shadow-md border border-gray-200">
      <div className="text-lg font-semibold text-gray-800 mb-4">
        예약 정보
      </div>
      <div className="grid grid-cols-1 gap-3">
        <div className="text-sm text-gray-600">
          <span className="font-medium text-gray-700">이름:</span> {name}
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium text-gray-700">별명:</span> {nickname}
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium text-gray-700">전화번호:</span> {phoneNumber}
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium text-gray-700">결제 상태:</span>{" "}
          <span
            className={`px-2 py-1 rounded-full text-white ${
              isPaid ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {isPaid ? "결제 완료" : "미결제"}
          </span>
        </div>
        {isManager&& <div className="text-end">
          <UpdateBookFeeStatusButton bookId={id}/>
        </div>}
      </div>
    </main>
  );
}
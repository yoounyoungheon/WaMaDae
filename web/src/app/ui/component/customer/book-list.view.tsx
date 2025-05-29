import { Book } from "@/app/business/book/book.domain";

export function BookListView({ books }: { books: Book[] }) {
  const bookedMembers = books.map((book) => {
    const { nickname, name } = book;
    return { nickname, name };
  });

  return (
    <main className="px-4">
      <div className="text-lg font-semibold mb-3">📖 예약자 현황 </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {bookedMembers.map((bookedMember, index) => (
          bookedMember.nickname && <div
            key={index}
            className="bg-white rounded-2xl shadow p-4 border border-slate-200 hover:shadow-md transition"
          >
            <div className="text-base font-medium text-gray-800">
              {bookedMember.nickname}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

import { Book } from "@/app/business/book/book.domain";
import { loadBooksByMeetingId } from "@/app/business/book/book.service";
import { BookInfo } from "@/app/ui/component/manager/bookInfo";

export default async function ManagerBookPage({
  searchParams,
  }: {
  searchParams: { [key: string]: string | undefined };
  }){
  const id = searchParams.id;
  let books: Book[] | null = null;

  if(typeof id !== 'undefined'){
  const response = await loadBooksByMeetingId(id);
  console.log(response)
  if(response.isSuccess && response.data){
    books = response.data;
    books.sort((a, b) => a.name.localeCompare(b.name));
  }
  }

  return (
  <main className="p-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
  {books && (
    books.map((book, index) => {
      return (
        <BookInfo key={index} book={book} isManager={true} />
      );
    })
  )}
  </main>
  )
}
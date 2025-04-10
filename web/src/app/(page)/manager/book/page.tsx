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
    }
  }

  return (
  <main className="p-10 grid grid-cols-4">
    {books&&(
      books.map((book, index)=>{
        return (
          <BookInfo key={index} book={book}/>
        )
      })
    )}
  </main>
  )
}
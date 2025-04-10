import Link from "next/link";

export function ManagerNav(){
  return (
    <div className="bg-sky-600 text-white p-4">
      <nav className="flex justify-between items-center px-10">
        <div className="text-lg font-bold">와마대 관리자 페이지</div>
        <ul className="flex space-x-6">
          <li>
            <Link href="/sign-in" className="hover:underline">
              로그인
            </Link>
          </li>
          <li>
            <Link href="/manager" className="hover:underline">
              메인화면
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  )
}
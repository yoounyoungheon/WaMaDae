import type { Metadata } from "next";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getTableKeywords } from "@/app/entity/table-keyword/api/table-keyword.server";
import { mapTableKeywordDto } from "@/app/entity/table-keyword/api/table-keyword.mapper";
import { tableKeywordQueryKeys } from "@/app/feature/table-keyword-select/api/table-keyword-query-keys";
import TableKeywordSelectPage from "@/app/feature/table-keyword-select/ui/TableKeywordSelectPage";
import PageHeader from "@/app/shared/ui/molecule/page-header";

export const metadata: Metadata = {
  title: "오늘의 테이블 키워드 선택 | WaMaDae",
};

export default async function TableKeywordPage() {
  const queryClient = new QueryClient();

  // 서버에서 same-origin BFF를 다시 호출하지 않고 server-only 조회 함수를 직접 사용한다.
  await queryClient.prefetchQuery({
    queryKey: tableKeywordQueryKeys.list(),
    queryFn: () => getTableKeywords().map(mapTableKeywordDto),
  });

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background-03 text-text-01">
      <PageHeader title="오늘의 테이블 키워드 선택" routeBackPath="/wine/ai" />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <TableKeywordSelectPage />
      </HydrationBoundary>
    </div>
  );
}

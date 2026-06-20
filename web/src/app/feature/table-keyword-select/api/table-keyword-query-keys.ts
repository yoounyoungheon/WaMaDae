export const tableKeywordQueryKeys = {
  all: ["table-keywords"] as const,
  list: () => [...tableKeywordQueryKeys.all, "list"] as const,
};

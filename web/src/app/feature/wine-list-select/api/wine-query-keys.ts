export const wineQueryKeys = {
  all: ["wines"] as const,
  details: () => [...wineQueryKeys.all, "detail"] as const,
  detail: (wineId: string) => [...wineQueryKeys.details(), wineId] as const,
  searches: () => [...wineQueryKeys.all, "search"] as const,
  search: (query: string) => [...wineQueryKeys.searches(), { query }] as const,
};

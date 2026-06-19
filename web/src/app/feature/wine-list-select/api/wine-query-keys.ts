export const wineQueryKeys = {
  all: ["wines"] as const,
  known: () => [...wineQueryKeys.all, "known"] as const,
  searches: () => [...wineQueryKeys.all, "search"] as const,
  search: (query: string) => [...wineQueryKeys.searches(), { query }] as const,
};

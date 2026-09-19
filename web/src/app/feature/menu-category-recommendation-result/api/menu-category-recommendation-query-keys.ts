/**
 * 메뉴 추천 query key factory.
 *
 * 세션마다 추천 결과가 다르므로 sessionId와 pairingWineIds를 모두 key에 포함한다.
 * 서로 다른 세션 값이 같은 cache로 섞이지 않게 한다.
 */
export const menuRecommendationQueryKeys = {
  all: ["wine-pairings", "recommend-menu"] as const,
  recommend: (sessionId: string, pairingWineIds: readonly string[]) =>
    [
      ...menuRecommendationQueryKeys.all,
      { sessionId, pairingWineIds },
    ] as const,
};

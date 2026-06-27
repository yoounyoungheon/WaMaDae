import type { WineRecommendationResult } from "@/app/entity/wine-recommendation/model/wine-recommendation.type";

export const wineRecommendationResultFixture: WineRecommendationResult = {
  wines: [
    {
      id: 1,
      koreanName: "샤또 라 로즈 드 비트락 루즈 2020",
      englishName: "Chateau La Rose de Vitrac Rouge 2020",
      price: "25,000원",
      description: "부드러운 레드와인이 필요하다면 이 친구로",
      area: "프랑스",
      rating: 4.5,
      rank: 1,
    },
    {
      id: 2,
      koreanName: "몬테스 알파 까베르네 소비뇽",
      englishName: "Montes Alpha Cabernet Sauvignon",
      price: "32,000원",
      description: "진한 과실향과 묵직한 바디감이 음식과 잘 어울려요",
      area: "칠레",
      rating: 4.3,
      rank: 2,
    },
    {
      id: 3,
      koreanName: "빌라 마리아 소비뇽 블랑",
      englishName: "Villa Maria Sauvignon Blanc",
      price: "28,000원",
      description: "상큼하고 산뜻해서 가볍게 시작하기 좋아요",
      area: "뉴질랜드",
      rating: 4.2,
      rank: 3,
    },
  ],
  followUpQuestions: [
    { id: 1, label: "이 와인과 어울리는 음식은?" },
    { id: 2, label: "가격대는 어떻게 되나요?" },
    { id: 3, label: "비슷한 다른 와인 추천" },
    { id: 4, label: "초보자도 마시기 좋나요?" },
  ],
  chat: {
    greetingMessage: "안녕하세요! 와인에 대해 궁금하신 점을 물어보세요.",
    sampleAnswer:
      "샤또 라 로즈는 부드러운 타닌과 과실향이 풍부해서 된장찌개, 불고기, 삼겹살 같은 한식과 잘 어울려요!",
  },
};

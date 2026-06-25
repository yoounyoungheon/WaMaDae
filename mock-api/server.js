const http = require("node:http");

const PORT = Number(process.env.PORT ?? 3030);
const HOST = "0.0.0.0";
const MOCK_API_PATH = "/api/mock";

const preferenceOptions = {
  data: {
    mood: [
      {
        label: "설레는",
        value: "excited",
        iconPath: "/images/wine-preferences/excited.svg",
      },
      {
        label: "편안한",
        value: "relaxed",
        iconPath: "/images/wine-preferences/relaxed.svg",
      },
      {
        label: "활기찬",
        value: "energetic",
        iconPath: "/images/wine-preferences/energetic.svg",
      },
      {
        label: "로맨틱한",
        value: "romantic",
        iconPath: "/images/wine-preferences/romantic.svg",
      },
      {
        label: "즐거운",
        value: "joyful",
        iconPath: "/images/wine-preferences/joyful.svg",
      },
      {
        label: "차분한",
        value: "calm",
        iconPath: "/images/wine-preferences/calm.svg",
      },
    ],
    alcohol: [
      { label: "낮음 (8–11%)", value: "low" },
      { label: "중간 (12–13%)", value: "medium" },
      { label: "높음 (14%+)", value: "high" },
      { label: "상관없음", value: "any" },
    ],
    pairingFood: [
      {
        label: "육류",
        value: "meat",
        options: [
          { label: "소고기 스테이크", value: "beefSteak" },
          { label: "돼지갈비", value: "porkRibs" },
          { label: "양갈비", value: "lambChops" },
          { label: "삼겹살", value: "porkBelly" },
        ],
      },
      {
        label: "해산물",
        value: "seafood",
        options: [
          { label: "생선회", value: "sashimi" },
          { label: "구운 생선", value: "grilledFish" },
          { label: "랍스터/새우", value: "lobsterAndShrimp" },
          { label: "조개찜", value: "steamedShellfish" },
        ],
      },
      {
        label: "치즈",
        value: "cheese",
        options: [
          { label: "숙성 치즈", value: "agedCheese" },
          { label: "블루 치즈", value: "blueCheese" },
          { label: "모짜렐라", value: "mozzarella" },
        ],
      },
      {
        label: "파스타",
        value: "pasta",
        options: [
          { label: "토마토 파스타", value: "tomatoPasta" },
          { label: "크림 파스타", value: "creamPasta" },
          { label: "오일 파스타", value: "oilPasta" },
        ],
      },
    ],
  },
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  response.end(JSON.stringify(payload, null, 2));
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host}`);
  const pathname =
    url.pathname.length > 1 && url.pathname.endsWith("/")
      ? url.pathname.slice(0, -1)
      : url.pathname;

  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    response.end();
    return;
  }

  if (pathname !== MOCK_API_PATH && pathname !== `${MOCK_API_PATH}/`) {
    sendJson(response, 404, {
      message: "Not Found",
      path: url.pathname,
    });
    return;
  }

  if (request.method !== "GET") {
    response.setHeader("Allow", "GET, OPTIONS");
    sendJson(response, 405, {
      message: "Method Not Allowed",
    });
    return;
  }

  sendJson(response, 200, preferenceOptions);
});

server.listen(PORT, HOST, () => {
  console.log(`Mock API server: http://localhost:${PORT}${MOCK_API_PATH}`);
});

function shutdown(signal) {
  console.log(`\n${signal} received. Closing mock API server.`);
  server.close(() => process.exit(0));
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

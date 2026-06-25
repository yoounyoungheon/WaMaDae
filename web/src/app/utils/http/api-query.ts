export const USE_MOCK_API = process.env.useMockApi === "true";

export const API_PATH =
  process.env.NODE_ENV === "development"
    ? USE_MOCK_API
      ? "http://localhost:3030"
      : "http://localhost:8080"
    : process.env.DEPLOY_PATH;

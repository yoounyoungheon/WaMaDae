import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { listGuideIds, readGuide, resolveGuides } from "./guides.js";

const server = new McpServer({
  name: "frontend-guidance-mcp",
  version: "0.1.0",
});

server.registerTool(
  "resolve_guides",
  {
    title: "Resolve Guides",
    description:
      "작업 설명과 수정 경로를 바탕으로 지금 읽어야 할 프론트엔드 가이드를 우선순위와 함께 반환합니다.",
    inputSchema: {
      task: z
        .string()
        .min(1)
        .describe("사용자 작업 설명 또는 현재 하려는 작업 요약"),
      targetPaths: z
        .array(z.string().min(1))
        .default([])
        .describe("현재 수정하려는 경로 목록"),
    },
  },
  async ({ task, targetPaths }) => {
    const guides = resolveGuides(task, targetPaths);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              guides,
              availableGuideIds: listGuideIds(),
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

server.registerTool(
  "read_guide",
  {
    title: "Read Guide",
    description:
      "선택한 guide id의 본문, source path 목록, source 존재 여부, 마지막 갱신 기준을 반환합니다.",
    inputSchema: {
      id: z
        .enum(listGuideIds() as [string, ...string[]])
        .describe("읽을 guide id"),
    },
  },
  async ({ id }) => {
    const guide = await readGuide(id as Parameters<typeof readGuide>[0]);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(guide, null, 2),
        },
      ],
    };
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Failed to start MCP server:", error);
  process.exit(1);
});

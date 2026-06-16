import { readFile, stat } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type GuideId = string;

export type GuidePriority = "high" | "medium" | "low";

type GuideTrigger = {
  paths: string[];
  keywords: string[];
};

export type GuideDefinition = {
  id: GuideId;
  title: string;
  summary: string;
  triggers: GuideTrigger;
  sources: string[];
  canonicalSources: string[];
  guideFiles: string[];
};

type GuideDataFile = {
  guidances: GuideDefinition[];
};

export type ResolvedGuide = {
  id: GuideId;
  reason: string;
  priority: GuidePriority;
};

export type GuideSourceStatus = {
  path: string;
  exists: boolean;
  lastModified: string | null;
};

export type GuideReadResult = {
  id: GuideId;
  title: string;
  summary: string;
  body: string;
  sourcePaths: string[];
  canonicalSourcePaths: string[];
  sources: GuideSourceStatus[];
  canonicalSources: GuideSourceStatus[];
  lastUpdated: string | null;
  lastUpdatedBasis: string;
};

const currentFilePath = fileURLToPath(import.meta.url);
const packageRoot = path.resolve(path.dirname(currentFilePath), "..");
const workspaceRoot = path.resolve(packageRoot, "..");
const require = createRequire(import.meta.url);

const normalizePath = (value: string) =>
  value.replaceAll("\\", "/").toLowerCase();
const normalizedWorkspaceRoot = normalizePath(workspaceRoot);

function toRepoRelativePath(value: string) {
  const normalizedValue = normalizePath(value);

  if (normalizedValue.startsWith(`${normalizedWorkspaceRoot}/`)) {
    return normalizedValue.slice(normalizedWorkspaceRoot.length + 1);
  }

  return normalizedValue;
}

const escapeRegex = (value: string) =>
  value.replace(/[|\\{}()[\]^$+?.]/g, "\\$&").replaceAll("*", "[^/]*");

const globToRegExp = (pattern: string) => {
  const normalized = pattern.replaceAll("\\", "/");
  const withDoubleStar = normalized.replaceAll("**", "::DOUBLE_STAR::");
  const escaped = escapeRegex(withDoubleStar)
    .replaceAll("::DOUBLE_STAR::", ".*")
    .replaceAll("/.*", "(?:/.*)?");

  return new RegExp(`^${escaped}$`, "i");
};

const pathMatches = (candidatePath: string, patterns: string[]) => {
  const normalizedCandidate = normalizePath(candidatePath);

  return patterns.some((pattern) => {
    const normalizedPattern = normalizePath(pattern);
    return globToRegExp(normalizedPattern).test(normalizedCandidate);
  });
};

const textIncludesKeyword = (text: string, keywords: string[]) => {
  const normalizedText = text.toLowerCase();
  return keywords.some((keyword) =>
    normalizedText.includes(keyword.toLowerCase()),
  );
};

const toAbsoluteSourcePath = (sourcePath: string) => {
  if (path.isAbsolute(sourcePath)) {
    return sourcePath;
  }

  if (normalizePath(sourcePath).startsWith("guidance/")) {
    return path.resolve(packageRoot, sourcePath);
  }

  return path.resolve(workspaceRoot, sourcePath);
};

async function readGuideMarkdown(filePath: string) {
  const absolutePath = toAbsoluteSourcePath(filePath);

  try {
    return await readFile(absolutePath, "utf8");
  } catch {
    return "";
  }
}

const guideData = require("../guidance/guidances.json") as Partial<GuideDataFile>;
const guides = guideData.guidances ?? [];

if (guides.length === 0) {
  throw new Error("guidance/guidances.json must contain at least one guidance");
}

const guideMap = new Map(guides.map((guide) => [guide.id, guide]));

const scoreToPriority = (score: number): GuidePriority => {
  if (score >= 6) {
    return "high";
  }

  if (score >= 3) {
    return "medium";
  }

  return "low";
};

export const resolveGuides = (
  task: string,
  targetPaths: string[],
): ResolvedGuide[] => {
  const normalizedTask = task.trim();
  const repoRelativeTargetPaths = targetPaths.map((targetPath) =>
    toRepoRelativePath(targetPath),
  );

  const matches = guides
    .map((guide) => {
      const matchedPaths = repoRelativeTargetPaths.filter((targetPath) =>
        pathMatches(targetPath, guide.triggers.paths),
      );
      const keywordMatched = textIncludesKeyword(
        normalizedTask,
        guide.triggers.keywords,
      );
      const storySignal =
        guide.id === "storybook-authoring" &&
        repoRelativeTargetPaths.some((targetPath) =>
          targetPath.endsWith(".stories.tsx"),
        );

      const score =
        matchedPaths.length * 4 +
        (keywordMatched ? 2 : 0) +
        (storySignal ? 2 : 0);

      if (score === 0) {
        return null;
      }

      const reasons: string[] = [];

      if (matchedPaths.length > 0) {
        reasons.push(`matched target path: ${matchedPaths[0]}`);
      }

      if (keywordMatched) {
        reasons.push(`matched task keywords for ${guide.id}`);
      }

      if (storySignal) {
        reasons.push("story file detected");
      }

      return {
        id: guide.id,
        reason: reasons.join("; "),
        priority: scoreToPriority(score),
        score,
      };
    })
    .filter(
      (value): value is ResolvedGuide & { score: number } => value !== null,
    )
    .sort(
      (left, right) =>
        right.score - left.score || left.id.localeCompare(right.id),
    );

  return matches.map(({ score: _score, ...guide }) => guide);
};

export const readGuide = async (id: GuideId): Promise<GuideReadResult> => {
  const guide = guideMap.get(id);

  if (!guide) {
    throw new Error(`Unknown guide id: ${id}`);
  }

  const sources = await Promise.all(
    guide.sources.map(async (sourcePath) => {
      const absolutePath = toAbsoluteSourcePath(sourcePath);

      try {
        const stats = await stat(absolutePath);

        return {
          path: sourcePath,
          exists: true,
          lastModified: stats.mtime.toISOString(),
        } satisfies GuideSourceStatus;
      } catch {
        return {
          path: sourcePath,
          exists: false,
          lastModified: null,
        } satisfies GuideSourceStatus;
      }
    }),
  );

  const canonicalSourceSet = new Set(guide.canonicalSources);
  const canonicalSources = sources.filter((source) =>
    canonicalSourceSet.has(source.path),
  );
  const guideMarkdownSections = await Promise.all(
    guide.guideFiles.map(async (filePath) => ({
      filePath,
      content: await readGuideMarkdown(filePath),
    })),
  );
  const guideMarkdownBody = guideMarkdownSections
    .filter((section) => section.content.trim().length > 0)
    .map((section) => section.content.trim())
    .join("\n\n---\n\n");

  const existingCanonicalSources = canonicalSources.filter(
    (source) => source.lastModified !== null,
  );
  const mostRecentSource = existingCanonicalSources.sort((left, right) => {
    return (
      new Date(right.lastModified as string).getTime() -
      new Date(left.lastModified as string).getTime()
    );
  })[0];

  return {
    id: guide.id,
    title: guide.title,
    summary: guide.summary,
    body: guideMarkdownBody,
    sourcePaths: guide.sources,
    canonicalSourcePaths: guide.canonicalSources,
    sources,
    canonicalSources,
    lastUpdated: mostRecentSource?.lastModified ?? null,
    lastUpdatedBasis: mostRecentSource
      ? `latest existing source mtime from ${mostRecentSource.path}`
      : "no listed canonical source files currently exist in the workspace",
  };
};

export const listGuideIds = () => guides.map((guide) => guide.id);

#!/usr/bin/env node
/* eslint-disable no-console */
import fs from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import { parse } from "@babel/parser";
import traversePkg from "@babel/traverse";

const traverse = traversePkg.default ?? traversePkg;

// -----------------------------
// Config
// -----------------------------
const STORYBOOK_DIR = process.argv[2] ?? "storybook-static";
const INDEX_JSON = path.join(STORYBOOK_DIR, "index.json");
const OUT_FILE =
  process.argv[3] ?? path.join(STORYBOOK_DIR, "components.meta.json");

// Atom/Molecule 판별 규칙(필요하면 수정)
function inferKindFromPath(componentPath, storiesPath) {
  const p = `${componentPath ?? ""} ${storiesPath ?? ""}`.toLowerCase();
  if (p.includes("/atom/")) return "atom";
  if (p.includes("/molecule/")) return "molecule";
  return "unknown";
}

function inferNameFromTitle(title) {
  if (!title) return "Unknown";
  const seg = title.split("/").filter(Boolean);
  return seg[seg.length - 1] ?? "Unknown";
}

// -----------------------------
// Safe literal extraction (ObjectExpression/ArrayExpression/primitive only)
// -----------------------------
function literalToValue(node) {
  if (!node) return undefined;
  switch (node.type) {
    case "StringLiteral":
    case "NumericLiteral":
    case "BooleanLiteral":
      return node.value;
    case "NullLiteral":
      return null;
    case "BigIntLiteral":
      // JSON에 BigInt는 못 넣으니 문자열 처리
      return node.value;
    case "TemplateLiteral":
      // 원본 텍스트가 필요하면 quasis를 join
      return node.quasis.map((q) => q.value.cooked ?? "").join("");
    case "ArrayExpression":
      return node.elements
        .map((el) => literalToValue(el))
        .filter((v) => v !== undefined);
    case "ObjectExpression": {
      const obj = {};
      for (const prop of node.properties) {
        if (prop.type !== "ObjectProperty") continue;
        if (prop.computed) continue;

        const key =
          prop.key.type === "Identifier"
            ? prop.key.name
            : prop.key.type === "StringLiteral"
            ? prop.key.value
            : undefined;

        if (!key) continue;

        const val = literalToValue(prop.value);

        // undefined는 JSON에 못 넣으니 스킵
        if (val === undefined) continue;
        obj[key] = val;
      }
      return obj;
    }
    default:
      // Identifier/CallExpression/ArrowFunctionExpression 등은 평가하지 않음
      return undefined;
  }
}

function getObjectProperty(objExpr, keyName) {
  if (!objExpr || objExpr.type !== "ObjectExpression") return undefined;
  for (const prop of objExpr.properties) {
    if (prop.type !== "ObjectProperty") continue;
    if (prop.computed) continue;

    const key =
      prop.key.type === "Identifier"
        ? prop.key.name
        : prop.key.type === "StringLiteral"
        ? prop.key.value
        : undefined;

    if (key === keyName) return prop.value;
  }
  return undefined;
}

// -----------------------------
// 1) Read index.json and build title -> { componentPath, storiesPath }
// -----------------------------
async function readIndexJson(indexPath) {
  const raw = await fs.readFile(indexPath, "utf-8");
  const json = JSON.parse(raw);

  // Storybook v7+의 index.json 구조에 맞춰 entries를 기대
  const entries = json.entries ?? {};
  const titleMap = new Map();

  for (const [id, entry] of Object.entries(entries)) {
    // entry: { title, name, importPath, componentPath, type, ... }
    const title = entry?.title;
    const importPath = entry?.importPath; // storiesPath
    const componentPath = entry?.componentPath;

    if (!title) continue;

    // 같은 title이 여러 번 나올 수 있으니, componentPath가 있는 걸 우선
    const prev = titleMap.get(title);
    const next = {
      title,
      storiesPath: importPath ?? prev?.storiesPath,
      componentPath: componentPath ?? prev?.componentPath,
      // id도 저장해두면 디버깅에 도움
      storyIds: prev?.storyIds ? [...prev.storyIds, id] : [id],
    };

    // 더 좋은 정보로 업데이트
    if (!prev) {
      titleMap.set(title, next);
    } else {
      const prevHasComp = Boolean(prev.componentPath);
      const nextHasComp = Boolean(next.componentPath);
      if (!prevHasComp && nextHasComp) {
        titleMap.set(title, next);
      } else {
        // comp 유무 동일이면 그냥 merge 형태로 유지
        titleMap.set(title, next);
      }
    }
  }

  return {
    version: json.v ?? json.version ?? undefined,
    titleMap,
  };
}

// -----------------------------
// 2) Parse each built *.stories*.js to extract:
//    - metaTitle
//    - argTypes (from default export meta object)
//    - args (representative story args)
//    - originalSources (docs.source.originalSource)
// -----------------------------
async function parseStoriesBundle(filePath) {
  const code = await fs.readFile(filePath, "utf-8");

  // babel parse (ESM, with a few tolerant plugins)
  const ast = parse(code, {
    sourceType: "module",
    plugins: [
      "jsx",
      "typescript",
      "classProperties",
      "objectRestSpread",
      "optionalChaining",
      "nullishCoalescingOperator",
      "decorators-legacy",
    ],
    errorRecovery: true,
  });

  let metaTitle = undefined;
  let metaArgTypes = undefined;

  // exportedName -> localName(minified var)
  const exportMap = new Map(); // e.g. "Default" -> "l"
  // order of exported names
  let namedExportsOrder = []; // e.g. ["Default", "ContentOnly", ...]
  // story var -> args object
  const storyArgsByLocal = new Map(); // "l" -> { ... }
  // story var -> originalSource string
  const originalSourceByLocal = new Map(); // "l" -> "..."
  // localName -> isStoryObject(init ObjectExpression) : optional debug
  const localStoryObjects = new Set();

  // 2-1) gather variable declarators:
  traverse(ast, {
    VariableDeclarator(path) {
      const id = path.node.id;
      const init = path.node.init;

      // meta object: const T = { title: "...", argTypes: {...}, ... }
      if (id?.type === "Identifier" && init?.type === "ObjectExpression") {
        const titleNode = getObjectProperty(init, "title");
        if (titleNode?.type === "StringLiteral") {
          // 가장 먼저 만나는 "title" 가진 object를 meta로 취급
          if (!metaTitle) {
            metaTitle = titleNode.value;
            const argTypesNode = getObjectProperty(init, "argTypes");
            metaArgTypes = literalToValue(argTypesNode);
          }
          return;
        }

        // named export order: const H = ["Default", ...]
        if (id.name === "H" && init.type === "ArrayExpression") {
          const order = literalToValue(init);
          if (
            Array.isArray(order) &&
            order.every((x) => typeof x === "string")
          ) {
            namedExportsOrder = order;
          }
          return;
        }

        // story object: const l = { args: {...}, render: ... } 형태일 수 있음
        // minified local var name일 확률이 높아 전부 저장해두고 export specifier에서 필터
        if (id.name.length <= 3) {
          const argsNode = getObjectProperty(init, "args");
          const argsVal = literalToValue(argsNode);
          if (argsVal && typeof argsVal === "object") {
            storyArgsByLocal.set(id.name, argsVal);
          }
          localStoryObjects.add(id.name);
        }
      }
    },

    // export { i as ContentOnly, l as Default, ... }
    ExportNamedDeclaration(path) {
      const specifiers = path.node.specifiers ?? [];
      for (const s of specifiers) {
        if (s.type !== "ExportSpecifier") continue;
        const local = s.local?.type === "Identifier" ? s.local.name : undefined;
        const exported =
          s.exported?.type === "Identifier" ? s.exported.name : undefined;
        if (local && exported) {
          exportMap.set(exported, local);
        }
      }
    },

    // story.parameters = { docs: { source: { originalSource: `...` } } }
    AssignmentExpression(path) {
      const left = path.node.left;
      const right = path.node.right;
      if (
        left?.type === "MemberExpression" &&
        left.object?.type === "Identifier" &&
        left.property?.type === "Identifier" &&
        left.property.name === "parameters" &&
        right?.type === "ObjectExpression"
      ) {
        const localName = left.object.name;

        // right에서 docs.source.originalSource 찾아오기
        const docsNode = getObjectProperty(right, "docs");
        if (!docsNode || docsNode.type !== "ObjectExpression") return;

        const sourceNode = getObjectProperty(docsNode, "source");
        if (!sourceNode || sourceNode.type !== "ObjectExpression") return;

        const originalSourceNode = getObjectProperty(
          sourceNode,
          "originalSource"
        );
        if (!originalSourceNode) return;

        const originalSourceVal = literalToValue(originalSourceNode);
        if (
          typeof originalSourceVal === "string" &&
          originalSourceVal.trim().length > 0
        ) {
          originalSourceByLocal.set(localName, originalSourceVal);
        }
      }
    },
  });

  if (!metaTitle) {
    return null; // meta title이 없으면 매칭 불가 -> 스킵
  }

  // 대표 스토리 선택: Default > 첫번째 order > 아무거나(exportMap 첫번째)
  function pickRepresentativeExportName() {
    if (exportMap.has("Default")) return "Default";
    if (namedExportsOrder.length > 0 && exportMap.has(namedExportsOrder[0]))
      return namedExportsOrder[0];
    const first = [...exportMap.keys()][0];
    return first ?? null;
  }

  const repExportName = pickRepresentativeExportName();
  const repLocal = repExportName ? exportMap.get(repExportName) : null;

  // args 추출:
  // 1) story args가 있으면 사용
  // 2) 없으면 originalSource에서 args.<key>를 찾아 기본값 {} 혹은 "" 등 생성(간단 버전: {}만)
  let repArgs = {};
  if (repLocal && storyArgsByLocal.has(repLocal)) {
    repArgs = storyArgsByLocal.get(repLocal);
  } else {
    repArgs = {};
  }

  // originalSources: export된 스토리들 순서대로 모으기 (order가 없으면 exportMap 순서)
  const orderedExportNames =
    namedExportsOrder.length > 0
      ? namedExportsOrder.filter((n) => exportMap.has(n))
      : [...exportMap.keys()];

  const originalSources = [];
  for (const exName of orderedExportNames) {
    const local = exportMap.get(exName);
    if (!local) continue;
    const src = originalSourceByLocal.get(local);
    if (typeof src === "string" && src.trim()) originalSources.push(src);
  }

  return {
    metaTitle,
    argTypes:
      metaArgTypes && typeof metaArgTypes === "object" ? metaArgTypes : {},
    args: repArgs && typeof repArgs === "object" ? repArgs : {},
    originalSources,
    debug: {
      filePath,
      repExportName,
      repLocal,
      exports: [...exportMap.entries()],
    },
  };
}

// -----------------------------
// 3) Generate components.meta.json
// -----------------------------
async function main() {
  // index.json 로드
  const { titleMap } = await readIndexJson(INDEX_JSON);

  // 번들 목록
  const bundlePatterns = [
    // storybook-static/assets/**/card.stories-xxxx.js 같은 형태
    `${STORYBOOK_DIR}/**/*.stories*.js`,
  ];
  const bundleFiles = await fg(bundlePatterns, { dot: true, onlyFiles: true });

  if (bundleFiles.length === 0) {
    throw new Error(`No *.stories*.js bundles found under: ${STORYBOOK_DIR}`);
  }

  // 번들 파싱해서 title 기준으로 데이터 모으기
  const bundleByTitle = new Map(); // title -> parsed bundle data
  for (const file of bundleFiles) {
    try {
      const parsed = await parseStoriesBundle(file);
      if (!parsed) continue;

      // 같은 title이 여러 번 나오면(드물지만) originalSources 많은 쪽을 우선
      const prev = bundleByTitle.get(parsed.metaTitle);
      if (!prev) {
        bundleByTitle.set(parsed.metaTitle, parsed);
      } else {
        const prevScore =
          (prev.originalSources?.length ?? 0) +
          (Object.keys(prev.argTypes ?? {}).length ?? 0);
        const nextScore =
          (parsed.originalSources?.length ?? 0) +
          (Object.keys(parsed.argTypes ?? {}).length ?? 0);
        if (nextScore > prevScore) bundleByTitle.set(parsed.metaTitle, parsed);
      }
    } catch (err) {
      console.warn(`[warn] Failed to parse bundle: ${file}`);
      console.warn(err?.message ?? err);
    }
  }

  // index.json titleMap 기준으로 components 생성
  const components = [];

  for (const [title, info] of titleMap.entries()) {
    const bundle = bundleByTitle.get(title);
    if (!bundle) continue; // 빌드 번들에서 title 못 찾으면 스킵

    const name = inferNameFromTitle(title);
    const componentPath = info.componentPath ?? null;
    const storiesPath = info.storiesPath ?? null;

    // atom/molecule 판단
    const kind = inferKindFromPath(componentPath, storiesPath);

    components.push({
      name,
      kind,
      componentPath,
      storiesPath,
      argTypes: bundle.argTypes ?? {},
      args: bundle.args ?? {},
      originalSources: bundle.originalSources ?? [],
    });
  }

  // titleMap엔 있는데 bundle이 없는 애들을 보고 싶으면 로그
  const missingTitles = [];
  for (const title of titleMap.keys()) {
    if (!bundleByTitle.has(title)) missingTitles.push(title);
  }
  if (missingTitles.length > 0) {
    console.log(
      `[info] Missing bundles for ${missingTitles.length} titles (skipped). Example:`,
      missingTitles.slice(0, 5)
    );
  }

  const out = {
    version: 1,
    generatedAt: new Date().toISOString(), // +09:00 고정 필요하면 아래 주석 참고
    source: { storybookIndex: INDEX_JSON.replaceAll("\\", "/") },
    components,
  };

  await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });
  await fs.writeFile(OUT_FILE, JSON.stringify(out, null, 2), "utf-8");

  console.log(`[ok] Wrote: ${OUT_FILE}`);
  console.log(`[ok] components: ${components.length}`);
}

// 실행
main().catch((e) => {
  console.error("[error]", e);
  process.exit(1);
});

/**
 * NOTE) generatedAt을 "2026-02-19T00:00:00+09:00"처럼 +09:00 포맷으로 고정하고 싶으면:
 * - Intl.DateTimeFormat 또는 date-fns-tz 같은 걸 쓰거나
 * - 간단히: new Date()를 KST로 변환해 문자열 생성 로직을 추가하면 됨.
 */

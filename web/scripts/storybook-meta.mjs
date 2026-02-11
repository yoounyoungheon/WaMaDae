import fs from "node:fs";
import path from "node:path";
import fg from "fast-glob";
import { parse } from "@babel/parser";
import traversePkg from "@babel/traverse";

const traverse = traversePkg.default ?? traversePkg;

/**
 * 매우 보수적인 "정적 JSON 추출" 유틸 함수.
 * - object literal / array / primitive / null 만 안전하게 변환한다.
 * - Identifier/CallExpression/SpreadElement 등은 평가하지 않고 undefined로 처리한다.
 */
function literalToValue(node) {
  if (!node) return undefined;
  switch (node.type) {
    case "StringLiteral":
    case "NumericLiteral":
    case "BooleanLiteral":
      return node.value;
    case "NullLiteral":
      return null;
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
        if (val !== undefined) obj[key] = val;
      }
      return obj;
    }
    case "ArrayExpression":
      return node.elements
        .map((el) => literalToValue(el))
        .filter((v) => v !== undefined);
    default:
      return undefined;
  }
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

/**
 * Storybook CSF에서:
 * - default export meta: title, componentName, argTypes
 * - named export stories: args, argTypes, parameters
 */
function extractFromStoriesFile(filePath) {
  const code = readText(filePath);

  const ast = parse(code, {
    sourceType: "module",
    plugins: [
      "typescript",
      "jsx",
      "decorators-legacy",
      "classProperties",
      "exportDefaultFrom",
      "exportNamespaceFrom",
    ],
  });

  const result = {
    filePath,
    meta: {
      title: undefined,
      component: undefined,
      argTypes: undefined,
      parameters: undefined,
    },
    stories: {},
  };

  traverse(ast, {
    ExportDefaultDeclaration(p) {
      const decl = p.node.declaration;
      if (decl.type === "ObjectExpression") {
        for (const prop of decl.properties) {
          if (prop.type !== "ObjectProperty" || prop.computed) continue;
          const key =
            prop.key.type === "Identifier"
              ? prop.key.name
              : prop.key.type === "StringLiteral"
              ? prop.key.value
              : undefined;

          if (!key) continue;

          if (key === "title") result.meta.title = literalToValue(prop.value);
          if (key === "argTypes")
            result.meta.argTypes = literalToValue(prop.value);
          if (key === "parameters")
            result.meta.parameters = literalToValue(prop.value);

          if (key === "component") {
            if (prop.value.type === "Identifier")
              result.meta.component = prop.value.name;
            if (prop.value.type === "MemberExpression")
              result.meta.component = "MemberExpression";
          }
        }
      }
    },
  });

  traverse(ast, {
    ExportNamedDeclaration(p) {
      const decl = p.node.declaration;
      if (!decl) return;

      if (decl.type === "VariableDeclaration") {
        for (const d of decl.declarations) {
          if (d.id.type !== "Identifier") continue;
          const exportName = d.id.name;
          const init = d.init;

          if (init && init.type === "ObjectExpression") {
            const story = {};
            for (const prop of init.properties) {
              if (prop.type !== "ObjectProperty" || prop.computed) continue;
              const key =
                prop.key.type === "Identifier"
                  ? prop.key.name
                  : prop.key.type === "StringLiteral"
                  ? prop.key.value
                  : undefined;
              if (!key) continue;

              if (key === "args") story.args = literalToValue(prop.value);
              if (key === "argTypes")
                story.argTypes = literalToValue(prop.value);
              if (key === "parameters")
                story.parameters = literalToValue(prop.value);
            }
            if (Object.keys(story).length) result.stories[exportName] = story;
          }

          if (init && init.type === "CallExpression") {
            result.stories[exportName] ??= {};
          }
        }
      }
    },
  });

  traverse(ast, {
    AssignmentExpression(p) {
      const left = p.node.left;
      const right = p.node.right;

      if (left.type !== "MemberExpression") return;
      if (left.object.type !== "Identifier") return;
      if (left.property.type !== "Identifier") return;

      const exportName = left.object.name;
      const key = left.property.name;

      if (!result.stories[exportName]) return;

      if (key === "args") {
        const v = literalToValue(right);
        if (v !== undefined) result.stories[exportName].args = v;
      }
      if (key === "argTypes") {
        const v = literalToValue(right);
        if (v !== undefined) result.stories[exportName].argTypes = v;
      }
      if (key === "parameters") {
        const v = literalToValue(right);
        if (v !== undefined) result.stories[exportName].parameters = v;
      }
    },
  });

  return result;
}

function mergeArgTypes(metaArgTypes, storyArgTypes) {
  return {
    ...(metaArgTypes ?? {}),
    ...(storyArgTypes ?? {}),
  };
}

function main() {
  const outPath = "./docs/storybook/meta.json";
  ensureDir(path.dirname(outPath));

  const storyFiles = fg.sync(["src/**/*.stories.@(ts|tsx|js|jsx)"], {
    dot: false,
  });

  const meta = {
    generatedAt: new Date().toISOString(),
    version: 1,
    files: [],
    stories: {},
  };

  for (const file of storyFiles) {
    const info = extractFromStoriesFile(file);
    meta.files.push({
      filePath: info.filePath,
      title: info.meta.title,
      component: info.meta.component,
      storyExports: Object.keys(info.stories),
    });

    const title = info.meta.title;

    for (const [exportName, story] of Object.entries(info.stories)) {
      // storyKey는 일단 "title::exportName"으로 생성 (Storybook id와 1:1 매핑은 다음 단계에서 가능)
      const storyKey = `${title ?? "(no-title)"}::${exportName}`;

      meta.stories[storyKey] = {
        title: title,
        component: info.meta.component,
        exportName,
        args: story.args ?? null,
        argTypes: mergeArgTypes(info.meta.argTypes, story.argTypes),
        parameters: {
          ...(info.meta.parameters ?? {}),
          ...(story.parameters ?? {}),
        },
        sourceFile: info.filePath,
      };
    }
  }

  fs.writeFileSync(outPath, JSON.stringify(meta, null, 2), "utf8");
  console.log(`✅ Wrote ${outPath}`);
  console.log(`- story files: ${storyFiles.length}`);
  console.log(`- extracted stories: ${Object.keys(meta.stories).length}`);
}

main();

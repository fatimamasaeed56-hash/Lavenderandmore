import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { mockupPreviewPlugin } from "../mockupPreviewPlugin.ts";

test("mockup discovery includes nested TSX and excludes private and hidden paths", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "mockup-discovery-"));
  const files = [
    "Card.tsx",
    "nested/Detail.tsx",
    "_private.tsx",
    "_private/Nested.tsx",
    "nested/_private/Nested.tsx",
    ".hidden.tsx",
    ".hidden/Nested.tsx",
    "nested/.hidden/Nested.tsx",
    "Other.ts",
  ];
  try {
    for (const file of files) {
      const target = path.join(root, "src/components/mockups", file);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, "export default function Mockup() { return null; }\n");
    }
    const plugin = mockupPreviewPlugin();
    plugin.configResolved({ root });
    await plugin.buildStart();
    const generatedPath = path.join(root, "src/.generated/mockup-components.ts");
    const source = await readFile(generatedPath, "utf8");
    assert.ok(source.includes('"./components/mockups/Card.tsx"'));
    assert.ok(source.includes('"./components/mockups/nested/Detail.tsx"'));
    assert.ok(source.includes('import("../components/mockups/nested/Detail.tsx")'));
    assert.equal((source.match(/\(\) => import/g) ?? []).length, 2);
    assert.ok(!source.includes("_private"));
    assert.ok(!source.includes(".hidden"));
    await plugin.buildStart();
    assert.equal(await readFile(generatedPath, "utf8"), source);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("mockup discovery handles a missing directory", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "mockup-empty-"));
  try {
    const plugin = mockupPreviewPlugin();
    plugin.configResolved({ root });
    await plugin.buildStart();
    const source = await readFile(path.join(root, "src/.generated/mockup-components.ts"), "utf8");
    assert.ok(!source.includes("() => import"));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

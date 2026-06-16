import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { RepositoryParamsSchema, SearchPageSizeSchema } from "./schema";

describe("SearchPageSizeSchema", () => {
  it.each([1, 10, 100])("1〜100 の整数 %i を受け入れる", (first) => {
    const result = v.safeParse(SearchPageSizeSchema, first);
    expect(result.success).toEqual(true);
    expect(result.output).toEqual(first);
  });

  it.each([0, 101, 5.5, -1])("範囲外の値 %o を拒否する", (first) => {
    const result = v.safeParse(SearchPageSizeSchema, first);
    expect(result.success).toEqual(false);
  });
});

describe("RepositoryParamsSchema", () => {
  it.each([
    { owner: "dummy-owner", name: "dummy-repo" },
    { owner: "a", name: "a" },
    { owner: "Dummy0wner", name: "repo.name_with-all.chars" },
  ])("正当なパラメータ %o を受け入れる", (params) => {
    const result = v.safeParse(RepositoryParamsSchema, params);
    expect(result.success).toEqual(true);
  });

  it.each([
    { owner: "", name: "dummy-repo" },
    { owner: "-leading-hyphen", name: "dummy-repo" },
    { owner: "trailing-hyphen-", name: "dummy-repo" },
    { owner: "has space", name: "dummy-repo" },
    { owner: "dummy-owner", name: "" },
    { owner: "dummy-owner", name: "bad/name" },
    { owner: "dummy-owner", name: `${"a".repeat(101)}` },
  ])("不正なパラメータ %o を拒否する", (params) => {
    const result = v.safeParse(RepositoryParamsSchema, params);
    expect(result.success).toEqual(false);
  });
});

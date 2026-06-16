import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { RepositorySearchParamsSchema } from "./schema";

describe("RepositorySearchParamsSchema", () => {
  it("未指定なら q は空文字・page は1（既定値）", () => {
    const result = v.safeParse(RepositorySearchParamsSchema, {});
    expect(result.success).toEqual(true);
    expect(result.output).toEqual({ q: "", page: 1 });
  });

  it("page を数値に変換して返す", () => {
    const result = v.safeParse(RepositorySearchParamsSchema, {
      q: "react",
      page: "3",
    });
    expect(result.success).toEqual(true);
    expect(result.output).toEqual({ q: "react", page: 3 });
  });

  it("page だけ未指定なら1になる", () => {
    const result = v.safeParse(RepositorySearchParamsSchema, { q: "react" });
    expect(result.success).toEqual(true);
    expect(result.output).toEqual({ q: "react", page: 1 });
  });

  it("q だけ未指定なら空文字になる", () => {
    const result = v.safeParse(RepositorySearchParamsSchema, { page: "2" });
    expect(result.success).toEqual(true);
    expect(result.output).toEqual({ q: "", page: 2 });
  });

  it("未知のキーは無視する", () => {
    const result = v.safeParse(RepositorySearchParamsSchema, {
      q: "react",
      page: "1",
      extra: "ignored",
    });
    expect(result.success).toEqual(true);
    expect(result.output).toEqual({ q: "react", page: 1 });
  });

  it.each(["0", "-1", "1.5", "abc", ""])(
    "不正な page (%o) を拒否する",
    (page) => {
      const result = v.safeParse(RepositorySearchParamsSchema, {
        q: "react",
        page,
      });
      expect(result.success).toEqual(false);
    },
  );

  it.each([{ q: 1 }, { q: ["a", "b"] }])(
    "q が文字列でない %o を拒否する",
    (params) => {
      const result = v.safeParse(RepositorySearchParamsSchema, params);
      expect(result.success).toEqual(false);
    },
  );

  it("page が文字列でない（数値）場合は拒否する", () => {
    const result = v.safeParse(RepositorySearchParamsSchema, { page: 2 });
    expect(result.success).toEqual(false);
  });
});

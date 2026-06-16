import { describe, expect, it } from "vitest";
import { buildSearchPath, getPageWindow } from "./search";

describe("buildSearchPath", () => {
  it("?q=...&page=... の形に組み立てる", () => {
    expect(buildSearchPath("react", 1)).toBe("/?q=react&page=1");
    expect(buildSearchPath("react", 3)).toBe("/?q=react&page=3");
  });

  it("pathname を差し替えられる", () => {
    expect(buildSearchPath("react", 2, "/search")).toBe(
      "/search?q=react&page=2",
    );
  });

  it("クエリをURLエンコードする", () => {
    expect(buildSearchPath("a b", 1)).toBe("/?q=a+b&page=1");
    expect(buildSearchPath("c++", 1)).toBe("/?q=c%2B%2B&page=1");
  });
});

describe("getPageWindow", () => {
  it("総ページ数を切り上げで算出する", () => {
    expect(getPageWindow(1, 25, 10).totalPages).toBe(3);
    expect(getPageWindow(1, 30, 10).totalPages).toBe(3);
    expect(getPageWindow(1, 31, 10).totalPages).toBe(4);
  });

  it("総ページ数を GitHub の1000件上限でキャップする", () => {
    // 10件/ページなら最大100ページ。
    expect(getPageWindow(1, 999_999, 10).totalPages).toBe(100);
  });

  it("先頭ページでは前方の省略記号・先頭リンクを出さない", () => {
    const w = getPageWindow(1, 1000, 10);
    expect(w.isFirst).toBe(true);
    expect(w.isLast).toBe(false);
    expect(w.showFirst).toBe(false);
    expect(w.showLeadingEllipsis).toBe(false);
    expect(w.pages[0]).toBe(1);
  });

  it("中央ページでは両側に窓・省略記号・先頭/末尾リンクを出す", () => {
    // 100ページ中50ページ目。
    const w = getPageWindow(50, 1000, 10);
    expect(w.pages).toEqual([48, 49, 50, 51, 52]);
    expect(w.showFirst).toBe(true);
    expect(w.showLeadingEllipsis).toBe(true);
    expect(w.showLast).toBe(true);
    expect(w.showTrailingEllipsis).toBe(true);
  });

  it("末尾ページでは後方の省略記号・末尾リンクを出さない", () => {
    const w = getPageWindow(100, 1000, 10);
    expect(w.isLast).toBe(true);
    expect(w.showLast).toBe(false);
    expect(w.showTrailingEllipsis).toBe(false);
    expect(w.pages.at(-1)).toBe(100);
  });

  it("範囲外のページは現在ページを総ページ数に丸める", () => {
    expect(getPageWindow(999, 30, 10).current).toBe(3);
    expect(getPageWindow(0, 30, 10).current).toBe(1);
    expect(getPageWindow(-5, 30, 10).current).toBe(1);
  });

  it("窓の開始が2のときは先頭リンクは出すが省略記号は出さない", () => {
    // 4ページ目 → 窓 [2,3,4,5,6] の開始が2。
    const w = getPageWindow(4, 1000, 10);
    expect(w.showFirst).toBe(true);
    expect(w.showLeadingEllipsis).toBe(false);
  });
});

// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { SearchResultCount } from "./search-result-count";

describe("SearchResultCount", () => {
  it("total を渡すと桁区切りで件数を status として表示する", () => {
    render(<SearchResultCount total={1234} />);
    expect(screen.getByRole("status")).toHaveTextContent("1,234 件");
  });

  it("total 未指定（読み込み中）は件数を出さない", () => {
    render(<SearchResultCount />);
    expect(screen.getByRole("status")).not.toHaveTextContent(/件/);
  });
});

// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { SearchResultCount } from "./search-result-count";

describe("SearchResultCount", () => {
  it("total を渡すと桁区切りで件数を表示する", () => {
    render(<SearchResultCount total={1234} />);
    expect(screen.getByText("1,234 件")).toBeInTheDocument();
  });

  it("total 未指定（読み込み中）はプレースホルダを表示し件数を出さない", () => {
    const { container } = render(<SearchResultCount />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
    expect(screen.queryByText(/件$/)).not.toBeInTheDocument();
  });
});

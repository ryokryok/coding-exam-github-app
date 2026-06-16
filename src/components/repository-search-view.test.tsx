// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RepositorySearchView } from "./repository-search-view";

// next/navigation の useRouter/usePathname をモック。
const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => "/",
}));

const makeItem = (id: string, name: string) => ({
  id,
  name,
  nameWithOwner: `dummy-owner/${name}`,
  ownerLogin: "dummy-owner",
  avatarUrl: "https://avatars.example.com/dummy-owner.png",
});

describe("RepositorySearchView", () => {
  beforeEach(() => pushMock.mockClear());

  it("検索語ありで結果0件のときは該当なしメッセージを出す", () => {
    render(
      <RepositorySearchView
        query="dummy-query"
        page={1}
        repositories={[]}
        total={0}
      />,
    );

    expect(
      screen.getByText(/「dummy-query」に一致するリポジトリはありませんでした/),
    ).toBeInTheDocument();
  });

  it("結果があるとき件数・カード・ページネーションを表示する", () => {
    const repositories = [
      makeItem("DUMMY_REPO_ID_1", "dummy-repo-1"),
      makeItem("DUMMY_REPO_ID_2", "dummy-repo-2"),
      makeItem("DUMMY_REPO_ID_3", "dummy-repo-3"),
    ];
    render(
      <RepositorySearchView
        query="dummy-query"
        page={1}
        repositories={repositories}
        total={200}
      />,
    );

    expect(screen.getByText("200 件")).toBeInTheDocument();
    expect(screen.getByText("dummy-owner/dummy-repo-1")).toBeInTheDocument();
    expect(screen.getByText("dummy-owner/dummy-repo-3")).toBeInTheDocument();
    // total=200 / pageSize=10 → 複数ページなのでページネーションが出る。
    expect(
      screen.getByRole("navigation", { name: /pagination/i }),
    ).toBeInTheDocument();
  });

  it("送信すると1ページ目の検索 URL へ遷移する", async () => {
    const user = userEvent.setup();
    render(
      <RepositorySearchView query="" page={1} repositories={[]} total={0} />,
    );

    await user.type(screen.getByRole("textbox"), "dummy-query");
    await user.click(screen.getByRole("button", { name: "検索" }));

    expect(pushMock).toHaveBeenCalledWith("/?q=dummy-query&page=1");
  });
});

// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { makeFragmentData } from "@/lib/gql";
import { RepositoryCard, RepositoryCardFragment } from "./repository-card";

const repository = makeFragmentData(
  {
    name: "dummy-repo",
    nameWithOwner: "dummy-owner/dummy-repo",
    owner: {
      login: "dummy-owner",
      avatarUrl: "https://avatars.example.com/dummy-owner.png",
    },
  },
  RepositoryCardFragment,
);

describe("RepositoryCard", () => {
  it("リポジトリ名と詳細ページへのリンクを表示する", () => {
    render(<RepositoryCard repository={repository} />);

    expect(screen.getByText("dummy-owner/dummy-repo")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/repos/dummy-owner/dummy-repo",
    );
  });

  it("オーナーのアバターを alt 付きで表示する", () => {
    render(<RepositoryCard repository={repository} />);

    expect(screen.getByRole("img")).toHaveAccessibleName(
      "dummy-owner のアイコン",
    );
  });
});

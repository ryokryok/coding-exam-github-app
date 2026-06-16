// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { RepositoryCard } from "./repository-card";

const props = {
  name: "dummy-repo",
  nameWithOwner: "dummy-owner/dummy-repo",
  ownerLogin: "dummy-owner",
  avatarUrl: "https://avatars.example.com/dummy-owner.png",
};

describe("RepositoryCard", () => {
  it("リポジトリ名と詳細ページへのリンクを表示する", () => {
    render(<RepositoryCard {...props} />);

    expect(screen.getByText("dummy-owner/dummy-repo")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/repos/dummy-owner/dummy-repo",
    );
  });

  it("オーナーのアバターを alt 付きで表示する", () => {
    render(<RepositoryCard {...props} />);

    expect(screen.getByRole("img")).toHaveAccessibleName(
      "dummy-owner のアイコン",
    );
  });
});

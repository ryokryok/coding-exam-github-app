# 課題用アプリ

[Next.js](https://nextjs.org) (App Router) ベースの課題用アプリです。

このアプリは GitHub API を用いて、リポジトリを検索、表示するアプリです。

## 初期設定

このプロジェクトは [mise](https://mise.jdx.dev) でツールのバージョンを管理しています。

```bash
# https://github.com/settings/personal-access-tokens
# Fine-grained personal access tokens を作成する
# 権限は Repository access : Public repositories のみで OK
cp .env.sample .env.local
# 作成したトークンを .env.local の API_TOKEN に設定する

# Node.js と pnpm の設定
mise install
# Git Hooks の設定
prek install
```

## 開発

```bash
pnpm install
# 開発サーバー起動
pnpm dev # http://localhost:3000
```

## GraphQL を変更する場合

GraphQL ドキュメント (クエリ・フラグメント) を変更したときは、型を再生成する必要があります。生成物（`src/lib/gql/`）はコミットされているため、ドキュメントを変更しない限り実行は不要です。

```bash
# GitHub の公開 GraphQL スキーマを取得 (初回のみ必要)
mise run download-schema
# GraphQL ドキュメントから型を再生成 (--watch で変更を監視)
pnpm codegen
```

### VSCodeでの入力補完

`mise run download-schema` で `schema.docs.graphql` を取得しておくと、推奨拡張の `graphql.vscode-graphql` が `graphql.config.ts` 経由でそれを読み込み、GraphQL クエリ編集時に入力補完が効きます

![GraphQL クエリの入力補完の例](docs/assets/vscode-graphql.png)

入力補完が出ない場合は、コマンドパレット（macOS: `Shift + Command + P` / Windows・Linux: `Ctrl + Shift + P`）で `GraphQL: Manual Restart`（`vscode-graphql.restart`）を実行して GraphQL サーバーを再起動してください。

## E2E テスト

Playwrightによるテストを実行します。

```shell
# mise run で対話式に選択しても OK
mise run e2e-test
```

---

## AI 活用で工夫した点

- Lintやテストを整備して、pre-commitツール (prek) やGitHub Actionsで確実に実行してチェックするようにした
  - AIに指示するより、仕組みで解決できることは仕組みに落とし込む
- 並列で回せる箇所は並列で回した
  - 複数の変更点がまとまっても、AIにコミット分割させることもできるため
- 出力されたコードはそのまま採用せず、レビューさせた
  - 「アクセシビリティの観点」や「テストコードのしやすさ」の観点で指示した、曖昧な指示だと方向性を見失うため
  - コメントも簡便に書くように直した
- GitHub Actions のサプライチェーン攻撃対策のため、コミット SHA で指定した
  - AIに対応してもらうのにコマンドで実行できるのが良いと思い `pinact` というツールを使った
- 言語やツールの管理とタスクランナーのために、 `mise` を採用した
  - `mise.toml` で必要なタスクはテキスト化しているので人間も AI も検知しやすくなっている
  - 環境構築を簡便化して、他の人が開発しやすくするため
- ターミナルとは別にデスクトップ版の Claude Code で下調べさせて、それをプロンプトとして渡して指示した
  - 「テストのモックはどうすればいい?」みたいな調査が必要なタスクなどを依頼した
  - ターミナル上のClaude Codeだと現行コードに引っ張られてしまうため
  - 下調べさせた後に指示を入れてやりたい方向に調整した

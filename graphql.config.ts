// VSCode の GraphQL 拡張（vscode-graphql / GraphQL Language Service）が読む設定。
// schema.docs.graphql をもとにクエリ・フラグメントの入力補完を提供する。
// documents は codegen.ts と揃え、生成物・テストは対象外にする。
import type { IGraphQLConfig } from "graphql-config";

const config: IGraphQLConfig = {
  schema: ["./schema.docs.graphql"],
  documents: [
    "./src/**/*.{graphql,js,ts,jsx,tsx}",
    "!./src/lib/gql/**",
    "!./src/**/*.test.{ts,tsx}",
  ],
};

export default config;

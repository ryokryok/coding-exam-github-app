import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "./schema.docs.graphql",
  documents: [
    "src/**/*.{ts,tsx}",
    "!src/lib/gql/**",
    "!src/**/*.test.{ts,tsx}",
  ],
  ignoreNoDocuments: true, // for better experience with the watcher
  generates: {
    "./src/lib/gql/": {
      preset: "client",
      config: {
        // import type {} を生成し tree-shaking しやすくする。
        useTypeImports: true,
        // GitHub のカスタムスカラーを扱いやすい型にマッピングする。
        scalars: {
          URI: "string",
          DateTime: "string",
          GitTimestamp: "string",
          HTML: "string",
          GitObjectID: "string",
          Base64String: "string",
        },
      },
    },
  },
};

export default config;

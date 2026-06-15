/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  fragment RepositoryCard on Repository {\n    name\n    nameWithOwner\n    owner {\n      login\n      avatarUrl\n    }\n  }\n": typeof types.RepositoryCardFragmentDoc,
    "\n  fragment RepositoryDetail on Repository {\n    nameWithOwner\n    description\n    url\n    stargazerCount\n    forkCount\n    watchers {\n      totalCount\n    }\n    issues(states: OPEN) {\n      totalCount\n    }\n    primaryLanguage {\n      name\n    }\n    owner {\n      login\n      avatarUrl\n    }\n  }\n": typeof types.RepositoryDetailFragmentDoc,
    "\n  query SearchRepositories($query: String!, $first: Int!, $after: String) {\n    search(query: $query, type: REPOSITORY, first: $first, after: $after) {\n      repositoryCount\n      pageInfo {\n        endCursor\n        hasNextPage\n      }\n      nodes {\n        ... on Repository {\n          id\n          ...RepositoryCard\n        }\n      }\n    }\n  }\n": typeof types.SearchRepositoriesDocument,
    "\n  query GetRepository($owner: String!, $name: String!) {\n    repository(owner: $owner, name: $name) {\n      ...RepositoryDetail\n    }\n  }\n": typeof types.GetRepositoryDocument,
};
const documents: Documents = {
    "\n  fragment RepositoryCard on Repository {\n    name\n    nameWithOwner\n    owner {\n      login\n      avatarUrl\n    }\n  }\n": types.RepositoryCardFragmentDoc,
    "\n  fragment RepositoryDetail on Repository {\n    nameWithOwner\n    description\n    url\n    stargazerCount\n    forkCount\n    watchers {\n      totalCount\n    }\n    issues(states: OPEN) {\n      totalCount\n    }\n    primaryLanguage {\n      name\n    }\n    owner {\n      login\n      avatarUrl\n    }\n  }\n": types.RepositoryDetailFragmentDoc,
    "\n  query SearchRepositories($query: String!, $first: Int!, $after: String) {\n    search(query: $query, type: REPOSITORY, first: $first, after: $after) {\n      repositoryCount\n      pageInfo {\n        endCursor\n        hasNextPage\n      }\n      nodes {\n        ... on Repository {\n          id\n          ...RepositoryCard\n        }\n      }\n    }\n  }\n": types.SearchRepositoriesDocument,
    "\n  query GetRepository($owner: String!, $name: String!) {\n    repository(owner: $owner, name: $name) {\n      ...RepositoryDetail\n    }\n  }\n": types.GetRepositoryDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment RepositoryCard on Repository {\n    name\n    nameWithOwner\n    owner {\n      login\n      avatarUrl\n    }\n  }\n"): (typeof documents)["\n  fragment RepositoryCard on Repository {\n    name\n    nameWithOwner\n    owner {\n      login\n      avatarUrl\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment RepositoryDetail on Repository {\n    nameWithOwner\n    description\n    url\n    stargazerCount\n    forkCount\n    watchers {\n      totalCount\n    }\n    issues(states: OPEN) {\n      totalCount\n    }\n    primaryLanguage {\n      name\n    }\n    owner {\n      login\n      avatarUrl\n    }\n  }\n"): (typeof documents)["\n  fragment RepositoryDetail on Repository {\n    nameWithOwner\n    description\n    url\n    stargazerCount\n    forkCount\n    watchers {\n      totalCount\n    }\n    issues(states: OPEN) {\n      totalCount\n    }\n    primaryLanguage {\n      name\n    }\n    owner {\n      login\n      avatarUrl\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SearchRepositories($query: String!, $first: Int!, $after: String) {\n    search(query: $query, type: REPOSITORY, first: $first, after: $after) {\n      repositoryCount\n      pageInfo {\n        endCursor\n        hasNextPage\n      }\n      nodes {\n        ... on Repository {\n          id\n          ...RepositoryCard\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query SearchRepositories($query: String!, $first: Int!, $after: String) {\n    search(query: $query, type: REPOSITORY, first: $first, after: $after) {\n      repositoryCount\n      pageInfo {\n        endCursor\n        hasNextPage\n      }\n      nodes {\n        ... on Repository {\n          id\n          ...RepositoryCard\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetRepository($owner: String!, $name: String!) {\n    repository(owner: $owner, name: $name) {\n      ...RepositoryDetail\n    }\n  }\n"): (typeof documents)["\n  query GetRepository($owner: String!, $name: String!) {\n    repository(owner: $owner, name: $name) {\n      ...RepositoryDetail\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;

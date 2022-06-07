import { gql } from '@apollo/client';
import { Issue } from '../../../../schema.graphql';

export const SEARCH_ISSUES_QUERY = gql`
  query SearchRepoIssues($query: String!) {
    search(first: 20, type: ISSUE, query: $query) {
      issueCount
      pageInfo {
        hasPreviousPage
        hasNextPage
        endCursor
        startCursor
      }
      nodes {
        ... on Issue {
          id
          number
          title
          state
          author {
            login
            avatarUrl
          }
          comments {
            totalCount
          }
        }
      }
    }
  }
`;

export interface IssueListResult {
  search: { nodes: Issue[] };
}

export const getIssueListQuery = (owner: string, repo: string, search?: string, status?: string) =>
  [
    `repo:${owner}/${repo}`,
    'is:issue',
    search && `(in:title '${search}' or in:body '${search}')`,
    status && `state:${status === 'OPEN' ? 'opened' : 'closed'}`,
    'sort:updated-desc',
  ]
    .filter(Boolean)
    .join(' ');

export const GET_ISSUE = gql`
  query GetIssueComments($owner: String!, $repo: String!, $issueNumber: Int!) {
    repository(name: $repo, owner: $owner) {
      issue(number: $issueNumber) {
        id
        number
        createdAt
        title
        body
        state
        author {
          login
          avatarUrl
        }

        comments(first: 20) {
          totalCount
          nodes {
            id
            body
            createdAt
            author {
              login
              avatarUrl
            }
          }
        }
      }
    }
  }
`;

export interface IssueCommentsResult {
  repository: { issue: Issue };
}

import { gql } from '@apollo/client';
import { Issue } from '../../../schema.graphql';

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
          body
          state
          resourcePath
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

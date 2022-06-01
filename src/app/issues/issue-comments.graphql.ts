import { gql } from '@apollo/client';
import { Issue } from '../../../schema.graphql';

export const GET_ISSUE_COMMENTS = gql`
  query GetIssueComments($issueNumber: Int!) {
    repository(name: "react", owner: "facebook") {
      issue(number: $issueNumber) {
        title
        comments(first: 20) {
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

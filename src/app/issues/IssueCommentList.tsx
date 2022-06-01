import { useQuery } from '@apollo/client';
import { FC } from 'react';
import { GET_ISSUE_COMMENTS, IssueCommentsResult } from './issue-comments.graphql';

interface IssueCommentListProps {
  issueNumber: number;
  className: string;
}

const IssueCommentList: FC<IssueCommentListProps> = ({ issueNumber, className }) => {
  const { data, loading, error } = useQuery<IssueCommentsResult>(GET_ISSUE_COMMENTS, {
    variables: { issueNumber },
  });

  const comments = data?.repository?.issue?.comments?.nodes;

  return error ? (
    <strong>Error</strong>
  ) : loading ? (
    <div>?</div>
  ) : (
    <ul className={'text-left text-xs ml-4 ' + className}>
      {comments?.map(
        (comment) =>
          comment && (
            <li key={comment.id} className="mt-1">
              <strong className="block">
                {comment.createdAt} von {comment.author?.login}
              </strong>
              <pre className="whitespace-pre-wrap">{comment.body}</pre>
            </li>
          ),
      )}
    </ul>
  );
};

export default IssueCommentList;

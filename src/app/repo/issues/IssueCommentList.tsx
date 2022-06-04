import { FC } from 'react';
import { IssueComment } from '../../../../schema.graphql';

interface IssueCommentListProps {
  comments: IssueComment[];
  className: string;
}

const IssueCommentList: FC<IssueCommentListProps> = ({ comments, className }) => (
  <ul className={'text-left text-xs ' + className}>
    {comments?.map(
      (comment) =>
        comment && (
          <li key={comment.id} className="mt-2">
            <strong className="block">
              {comment.createdAt} von {comment.author?.login}
            </strong>
            <pre className="whitespace-pre-wrap">{comment.body}</pre>
          </li>
        ),
    )}
  </ul>
);

export default IssueCommentList;

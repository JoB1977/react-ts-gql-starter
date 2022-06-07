import { useQuery } from '@apollo/client';
import { FC, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { IssueComment } from '../../../../schema.graphql';
import Button from '../../../components/Button';
import Spinner from '../../../components/Spinner';
import { GET_ISSUE, IssueCommentsResult } from './issues.qraphql';
import IssueCommentList from './IssueCommentList';

const IssueItem: FC = () => {
  const { owner, repo, issueNumber } = useParams<'owner' | 'repo' | 'issueNumber'>();

  const { data, loading, error } = useQuery<IssueCommentsResult>(GET_ISSUE, {
    variables: { owner, repo, issueNumber: +(issueNumber || '0') },
  });

  const [displayComments, setDisplayComments] = useState<boolean>(false);

  const issue = data?.repository.issue;

  if (!issue) {
    return loading ? (
      <Spinner className="m-auto mt-20 w-20 h-20" />
    ) : (
      <strong>Ooops, something went wrong: {error + ''}</strong>
    );
  }

  const handleDisplayComments = () => {
    setDisplayComments(!displayComments);
  };

  return (
    <article>
      <header>
        <h2
          className={
            'block font-bold py-1 p-2 rounded ' +
            (issue.state === 'CLOSED' ? 'bg-red-400' : 'bg-green-400')
          }
        >
          <Link to={`/${owner}/${repo}`} title="zurück" className="fonnt-bold mr-3">
            &larr;
          </Link>

          {issue.title}
        </h2>

        <small className="text-xs text-gray-500">
          {issue.createdAt} von {issue.author?.login}
        </small>
      </header>

      <pre className="whitespace-pre-wrap p-2 my-4 border rounded">{issue.body}</pre>

      {issue.comments.totalCount ? (
        <>
          <Button className="mr-auto" onClick={handleDisplayComments}>
            <b>{issue.comments.totalCount} Kommentare</b>{' '}
            {displayComments ? 'verbergen' : 'anzeigen'}
          </Button>
          {displayComments ? (
            <IssueCommentList
              comments={issue.comments.nodes as IssueComment[]}
              className={issue.state === 'CLOSED' ? 'text-red-500' : 'text-green-500'}
            />
          ) : null}
        </>
      ) : null}
    </article>
  );
};

export default IssueItem;

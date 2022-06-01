import { FC, SyntheticEvent, useState } from 'react';
import { Issue } from '../../../schema.graphql';
import Button from '../../components/Button';
import IssueCommentList from './IssueCommentList';

interface IssueProps {
  index: number;
  issue: Issue;
  open?: boolean;
  onToggleOpen?: (event: { issueId: string; open: boolean }) => any;
}

const IssueItem: FC<IssueProps> = ({ index, issue, open, onToggleOpen }) => {
  const [displayComments, setDisplayComments] = useState(false);

  const handleToggleOpen = () => {
    onToggleOpen?.({ issueId: issue.id, open: !open });
  };

  const handleDisplayComments = (e: SyntheticEvent) => {
    setDisplayComments(!displayComments);
  };

  return (
    <li className="flex mt-1 py-1 px-2 hover:bg-gray-50">
      <b
        className={
          'mr-2 px-1 text-white rounded ' +
          (issue.state === 'CLOSED' ? 'bg-red-400' : 'bg-green-400')
        }
      >
        {index + 1}.
      </b>

      <div className="flex-grow">
        <strong className="block text-gray-500 cursor-pointer" onClick={handleToggleOpen}>
          {issue.title}
        </strong>

        {open ? <pre className="whitespace-pre-wrap">{issue.body}</pre> : null}

        {issue.comments.totalCount ? (
          <div className={`text-right ${displayComments ? ' mt-4' : ''}`}>
            {issue.comments.totalCount} Kommentare
            <Button className="ml-2" onClick={handleDisplayComments}>
              {displayComments ? 'verbergen' : 'anzeigen'}
            </Button>
            {displayComments ? (
              <IssueCommentList
                issueNumber={issue.number}
                className={issue.state === 'CLOSED' ? 'text-red-400' : 'text-green-400'}
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </li>
  );
};

export default IssueItem;

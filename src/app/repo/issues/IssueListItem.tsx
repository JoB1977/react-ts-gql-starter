import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Issue } from '../../../../schema.graphql';

interface IssueItemProps {
  owner: string;
  repo: string;
  index: number;
  issue: Issue;
}

const IssueListItem: FC<IssueItemProps> = ({ owner, repo, index, issue }) => {
  return (
    <li className="flex mt-1 py-1 hover:bg-gray-50">
      <b
        className={
          'mr-2 px-1 text-white rounded ' +
          (issue.state === 'CLOSED' ? 'bg-red-400' : 'bg-green-400')
        }
      >
        {index + 1}.
      </b>

      <Link to={`/${owner}/${repo}/issues/${issue.number}`} className="flex-grow">
        <strong className="block text-gray-500 cursor-pointer">{issue.title}</strong>
      </Link>

      <aside>{issue.comments.totalCount} Kommentare</aside>
    </li>
  );
};

export default IssueListItem;

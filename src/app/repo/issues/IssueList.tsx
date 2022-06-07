import { useQuery } from '@apollo/client';
import { FC } from 'react';
import Spinner from '../../../components/Spinner';
import { SEARCH_ISSUES_QUERY, IssueListResult, getIssueListQuery } from './issues.qraphql';
import IssueListItem from './IssueListItem';

interface IssueListProps {
  owner: string;
  repo: string;
  search?: string;
  status?: string;
}

const IssueList: FC<IssueListProps> = ({ owner, repo, search, status }) => {
  const { loading, data } = useQuery<IssueListResult>(SEARCH_ISSUES_QUERY, {
    variables: { query: getIssueListQuery(owner, repo, search, status) },
  });
  const issues = data?.search?.nodes;

  if (!issues) {
    return loading ? (
      <Spinner className="m-auto mt-20 w-20 h-20" />
    ) : (
      <strong>Ooops, something went wrong</strong>
    );
  }

  return (
    <ul>
      {issues?.map(
        (issue, i) =>
          issue?.id && (
            <IssueListItem key={issue.id} owner={owner} repo={repo} issue={issue} index={i} />
          ),
      )}
    </ul>
  );
};

export default IssueList;

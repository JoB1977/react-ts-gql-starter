import { useQuery } from '@apollo/client';
import { uniq } from 'lodash';
import { FC, useState } from 'react';
import Button from '../../components/Button';
import { SEARCH_ISSUES_QUERY, IssueListResult } from './issue-list.qraphql';
import IssueItem from './IssueItem';

interface IssueListProps {
  search: string;
  status: string;
}

const IssueList: FC<IssueListProps> = ({ search, status }) => {
  const [opened, setOpened] = useState<string[]>([]);

  const query = [
    'repo:facebook/react',
    'is:issue',
    search && `(in:title '${search}' or in:body '${search}')`,
    status && `state:${status}`,
    'sort:updated-desc',
  ]
    .filter(Boolean)
    .join(' ');

  const { loading, data, error } = useQuery<IssueListResult>(SEARCH_ISSUES_QUERY, {
    variables: { query },
  });
  const issues = data?.search?.nodes;

  const handleIssueToggleOpen = ({ issueId, open }: { issueId: string; open: boolean }) => {
    const newOpened = uniq(open ? [...opened, issueId] : opened.filter((id) => id !== issueId));
    setOpened(newOpened);
  };

  return error ? (
    <strong>Ooops, something went wrong</strong>
  ) : loading ? (
    <div>?</div>
  ) : (
    <>
      {opened.length ? (
        <Button className="block mb-2 ml-auto" onClick={() => setOpened([])}>
          Alle zuklappen
        </Button>
      ) : null}
      <ul>
        {issues?.map(
          (issue, i) =>
            issue?.id && (
              <IssueItem
                key={issue.id}
                issue={issue}
                index={i}
                open={opened.includes(issue.id)}
                onToggleOpen={handleIssueToggleOpen}
              />
            ),
        )}
      </ul>
    </>
  );
};

export default IssueList;

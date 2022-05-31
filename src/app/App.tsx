import { gql, useQuery } from '@apollo/client';
import { debounce } from 'lodash';
import { FC, SyntheticEvent, useState } from 'react';
import Button from '../components/Button';
import { Issue } from '../../schema.graphql';

const SEARCH_ISSUES_QUERY = gql`
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
          title
          body
          state
          author {
            login
          }
        }
      }
    }
  }
`;

interface IssuesResult {
  search: { nodes: Issue[] };
}

const statusOptions = ['', 'open', 'closed'];

const App: FC = () => {
  const [opened, setOpened] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const query = [
    'repo:facebook/react',
    'is:issue',
    search && `(in:title '${search}' or in:body '${search}')`,
    status && `state:${status}`,
    'sort:updated-desc',
  ]
    .filter(Boolean)
    .join(' ');

  const { loading, data } = useQuery<IssuesResult>(SEARCH_ISSUES_QUERY, {
    variables: { query },
  });
  const issues = data?.search?.nodes;

  const handleToggleIssue = (issueId: string) => {
    const newOpened = opened.includes(issueId)
      ? opened.filter((id) => id !== issueId)
      : [...opened, issueId];

    setOpened(newOpened);
  };

  const handleSearchChange = debounce((e: SyntheticEvent) => {
    setSearch((e.target as HTMLInputElement).value);
  }, 500);

  const handleStatusChange = (e: SyntheticEvent) => {
    setStatus((e.target as HTMLSelectElement).value);
  };

  return (
    <div className="m-8">
      <h1 className="font-bold text-2xl">Simple Github GraphQL API Explorer</h1>

      <div className="my-4 flex">
        <div className="relative flex-grow">
          <input
            type="text"
            className="block w-full border-2 rounded peer"
            onInput={handleSearchChange}
          />
          <label className="absolute text-gray-500 left-5 top-0 peer-focus:left-0 peer-focus:top-[-50%] peer-focus:text-xs pointer-events-none">
            Suche im Title / Body
          </label>
        </div>

        <select className="border-2 rounded ml-2" value={status} onChange={handleStatusChange}>
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s || '-'}
            </option>
          ))}
        </select>
        {opened.length ? (
          <Button className="ml-2" onClick={() => setOpened([])}>
            Alle zuklappen
          </Button>
        ) : null}
      </div>

      {loading ? (
        <div>?</div>
      ) : (
        <ul>
          {issues?.map(
            (issue, i) =>
              issue?.id && (
                <li
                  key={issue.id}
                  className="flex mt-1 py-1 px-2 hover:bg-gray-50"
                  onClick={() => handleToggleIssue(issue.id)}
                >
                  <b
                    className={
                      'mr-2 px-1 text-white rounded ' +
                      (issue.state === 'CLOSED' ? 'bg-red-400' : 'bg-green-400')
                    }
                  >
                    {i + 1}.
                  </b>

                  <div>
                    <strong className="block text-gray-500">{issue.title}</strong>

                    {opened.includes(issue.id) ? (
                      <pre className="whitespace-pre-wrap">{issue.body}</pre>
                    ) : null}
                  </div>
                </li>
              ),
          )}
        </ul>
      )}
    </div>
  );
};

export default App;

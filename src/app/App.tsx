import Button from '../components/Button';
import { gql, useQuery } from '@apollo/client';
import { FC, useState } from 'react';
import { Repository } from '../../schema.graphql';

const GET_ISSUES_QUERY = gql`
  query GetRepoIssues {
    repository(owner: "facebook", name: "React") {
      nameWithOwner
      issues(first: 20) {
        pageInfo {
          hasNextPage
          endCursor
          endCursor
          startCursor
        }
        nodes {
          id
          title
          body
          state
        }
      }
    }
  }
`;

interface IRepoIssuesResult {
  repository: Repository;
}

const App: FC = () => {
  const { loading, data } = useQuery<IRepoIssuesResult>(GET_ISSUES_QUERY);

  const [opened, setOpened] = useState<string[]>([]);

  const handleToggleIssue = (issueId: string) => {
    const newOpened = opened.includes(issueId)
      ? opened.filter((id) => id !== issueId)
      : [...opened, issueId];

    setOpened(newOpened);
  };

  return (
    <div className="m-8">
      <h1 className="font-bold text-2xl">Simple Github GraphQL API Explorer</h1>

      <div className="my-4">
        <div className="relative">
          <input type="text" className="block w-full border-2 rounded peer" />
          <label className="absolute text-gray-500 left-5 top-0 peer-focus:top-[-50%] peer-focus:text-xs">
            Suche im Title / Body
          </label>
        </div>
      </div>

      <section>
        {opened.length ? (
          // <button className="bg-gray-300 px-4 rounded mb-4" onClick={() => setOpened([])}>
          //   Alle zuklappen
          // </button>
          <Button className="mb-4" onClick={() => setOpened([])}>
            Alle zuklappen
          </Button>
        ) : null}
      </section>

      {loading ? (
        <div>?</div>
      ) : (
        <ul>
          {data?.repository?.issues?.nodes?.map(
            (issue, i) =>
              issue && (
                <li
                  key={issue.id}
                  className="flex mt-1 py-1 px-2 hover:bg-gray-50"
                  onClick={() => handleToggleIssue(issue.id)}
                >
                  <b className="mr-2 px-1 bg-orange-200 text-white rounded">{i + 1}.</b>

                  <div>
                    <strong className="block text-gray-500">{issue.title}</strong>

                    {opened.includes(issue.id) ? <pre>{issue.body}</pre> : null}
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

import { FC, useState } from 'react';
import IssueList from './issues/IssueList';
import IssuesSearch from './issues/IssuesSearch';

const App: FC = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  return (
    <div className="m-8">
      <h1 className="font-bold text-2xl">Simple Github GraphQL API Explorer</h1>

      <IssuesSearch
        search={search}
        status={status}
        onSearch={(s) => setSearch(s)}
        onStatusChange={(s) => setStatus(s)}
      ></IssuesSearch>

      <IssueList search={search} status={status}></IssueList>
    </div>
  );
};

export default App;

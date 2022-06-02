import { FC, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import IssueList from './issues/IssueList';
import IssuesSearch from './issues/IssuesSearch';

const Repo: FC = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  return (
    <>
      <IssuesSearch
        search={search}
        status={status}
        onSearch={(s) => setSearch(s)}
        onStatusChange={(s) => setStatus(s)}
      ></IssuesSearch>

      <IssueList search={search} status={status}></IssueList>
    </>
  );
};

const App: FC = () => {
  return (
    <main className="m-8">
      <header>
        <h1 className="font-bold text-2xl">Simple Github GraphQL API Explorer</h1>
      </header>

      <Routes>
        <Route path="/" element={<Navigate to="facebook/react" />} />
        <Route path=":owner/:repo" element={<Repo></Repo>} />
      </Routes>
    </main>
  );
};

export default App;

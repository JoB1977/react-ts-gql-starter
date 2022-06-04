import { FC } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import IssueItem from './repo/issues/IssueItem';

import Repo from './repo/Repo';

const App: FC = () => {
  return (
    <main className="m-8">
      <header className="mb-4">
        <h1 className="font-bold text-2xl">
          <Link to="/">Simple Github GraphQL API Explorer</Link>
        </h1>
      </header>

      <Routes>
        <Route path="/" element={<Navigate to="facebook/react" />} />
        <Route path=":owner/:repo" element={<Repo />} />
        <Route path=":owner/:repo/issues/:issueNumber" element={<IssueItem />} />
      </Routes>
    </main>
  );
};

export default App;

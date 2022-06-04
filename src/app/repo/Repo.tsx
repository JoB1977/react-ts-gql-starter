import { FC, useState } from 'react';
import { useParams } from 'react-router-dom';
import IssueList from './issues/IssueList';
import IssuesSearch from './issues/IssuesSearch';

const Repo: FC = () => {
  const { owner, repo } = useParams<'owner' | 'repo'>();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  return (
    <div>
      <IssuesSearch
        search={search}
        status={status}
        onSearch={(s) => setSearch(s)}
        onStatusChange={(s) => setStatus(s)}
      />

      <IssueList owner={owner as string} repo={repo as string} search={search} status={status} />
    </div>
  );
};

export default Repo;

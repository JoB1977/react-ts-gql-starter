import { debounce } from 'lodash';
import { FC, SyntheticEvent, useEffect, useRef } from 'react';
import Input from '../../components/Input';
import Select from '../../components/Select';

export interface IssuesSearchProps {
  search: string;
  status: string;
  onSearch: (search: string) => any;
  onStatusChange: (status: string) => any;
}

const statusOptions = ['', 'open', 'closed'];

const IssuesSearch: FC<IssuesSearchProps> = ({ search, status, onSearch, onStatusChange }) => {
  const inputEl = useRef<HTMLInputElement>(null);

  // ! use effect since handling input-changes is debounced
  // ! setting value directly to element will avoid that changes have effects
  useEffect(() => {
    if (inputEl?.current) {
      inputEl.current.value = search;
    }
  });

  const handleSearch = debounce((e: SyntheticEvent) => {
    onSearch((e.target as HTMLInputElement).value);
  }, 500);

  const handeStatusChange = (e: SyntheticEvent) => {
    onStatusChange((e.target as HTMLSelectElement).value);
  };

  return (
    <div className="my-4 flex">
      <Input
        ref={inputEl}
        type="text"
        label="Suche im Title / Body"
        className="flex-grow"
        onInput={handleSearch}
      ></Input>

      <Select className="min-w-10 ml-2" label="Status" value={status} onChange={handeStatusChange}>
        {statusOptions.map((s) => (
          <option key={s} value={s}>
            {s || '-'}
          </option>
        ))}
      </Select>
    </div>
  );
};

export default IssuesSearch;

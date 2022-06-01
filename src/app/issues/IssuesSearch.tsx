import { debounce } from 'lodash';
import { FC, SyntheticEvent, useEffect, useRef } from 'react';

interface IssuesSearchProps {
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
      <div className="relative flex-grow">
        <input
          ref={inputEl}
          type="text"
          className="block w-full border-2 rounded peer"
          onInput={handleSearch}
        />
        <label className="absolute text-gray-500 left-5 top-0 peer-focus:left-0 peer-focus:top-[-50%] peer-focus:text-xs pointer-events-none">
          Suche im Title / Body
        </label>
      </div>

      <select className="border-2 rounded ml-2" value={status} onChange={handeStatusChange}>
        {statusOptions.map((s) => (
          <option key={s} value={s}>
            {s || '-'}
          </option>
        ))}
      </select>
    </div>
  );
};

export default IssuesSearch;

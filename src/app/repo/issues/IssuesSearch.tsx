import { debounce } from 'lodash';
import { FC, SyntheticEvent, useEffect, useId } from 'react';
import Input from '../../../components/Input';
import Select from '../../../components/Select';

export interface IssuesSearchProps {
  search: string;
  status: string;
  onSearch: (search: string) => void;
  onStatusChange: (status: string) => void;
}

const statusOptions = ['', 'OPEN', 'CLOSED'];

const IssuesSearch: FC<IssuesSearchProps> = ({ search, status, onSearch, onStatusChange }) => {
  const inputId = useId();

  // ! use effect since handling input-changes is debounced
  // ! setting value directly to element will avoid that changes have effects
  // @todo find a better solution
  useEffect(() => {
    const inputEl = document.getElementById(inputId) as HTMLInputElement;
    inputEl.value = search;
  }, [search, inputId]);

  const handleSearch = debounce((e: SyntheticEvent) => {
    onSearch((e.target as HTMLInputElement).value);
  }, 500);

  const handeStatusChange = (e: SyntheticEvent) => {
    onStatusChange((e.target as HTMLSelectElement).value);
  };

  return (
    <div className="my-4 flex">
      <Input
        id={inputId}
        type="text"
        label="Suche im Title / Body"
        className="flex-grow"
        onInput={handleSearch}
      />

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

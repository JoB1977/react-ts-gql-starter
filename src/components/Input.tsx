import {
  DetailedHTMLProps,
  FC,
  InputHTMLAttributes,
  ReactElement,
  ReactFragment,
  useRef,
} from 'react';

export interface InputProps
  extends DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
  label?: string | number | ReactElement | ReactFragment | null;
  labelClassName?: string;
}

const Input: FC<InputProps> = ({ className, label, labelClassName, ...props }) => {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div className={`relative border rounded ${className ?? ''}`}>
      <input
        ref={ref}
        {...props}
        className="block w-full focus:outline-none px-2 py-1"
        placeholder=" "
      />

      {label != null ? (
        <label
          className={`absolute text-xs top-[-30%] left-2 bg-white px-1 ${labelClassName ?? ''}`}
        >
          {label}
        </label>
      ) : null}
    </div>
  );
};

export default Input;

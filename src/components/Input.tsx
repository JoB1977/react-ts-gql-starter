import { DetailedHTMLProps, FC, InputHTMLAttributes, ReactElement, ReactFragment } from 'react';

export interface InputProps
  extends DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
  label?: string | number | ReactElement | ReactFragment | null;
  labelClassName?: string;
}

const Input: FC<InputProps> = ({ className, children, label, labelClassName, ...props }) => (
  <div className={`relative border rounded ${className ?? ''}`}>
    <input {...props} className="block w-full focus:outline-none px-2 py-1" placeholder=" " />

    {label != null ? (
      <label className="absolute text-xs top-[-30%] left-2 bg-white px-1">{label}</label>
    ) : null}
  </div>
);

export default Input;

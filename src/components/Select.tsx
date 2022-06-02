import { DetailedHTMLProps, FC, ReactElement, ReactFragment, SelectHTMLAttributes } from 'react';

export interface SelectProps
  extends DetailedHTMLProps<SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement> {
  label?: string | number | ReactElement | ReactFragment | null;
  labelClassName?: string;
}

const Input: FC<SelectProps> = ({ className, children, label, labelClassName, ...props }) => (
  <div className={`relative border rounded ${className ?? ''}`}>
    <select {...props} className="block w-full focus:outline-none px-2 py-1" placeholder=" ">
      {children}
    </select>

    {label != null ? (
      <label className="absolute text-xs top-[-30%] left-2 bg-white px-1">{label}</label>
    ) : null}
  </div>
);

export default Input;

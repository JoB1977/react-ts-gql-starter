import { ButtonHTMLAttributes, DetailedHTMLProps, FC } from 'react';

const Button: FC<DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>> = ({
  className,
  children,
  ...props
}) => (
  <button className={'bg-gray-300 px-4 rounded ' + className} {...props}>
    {children}
  </button>
);

export default Button;

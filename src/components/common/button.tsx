import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
};
const Button: React.FC<Props> = ({ children, loading, ...rest }) => (
  <button disabled={loading || rest.disabled} {...rest}>
    {loading ? "..." : children}
  </button>
);
export default Button;

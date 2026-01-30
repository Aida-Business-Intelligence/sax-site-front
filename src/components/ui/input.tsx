import React from "react";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input(props, ref) {
    return (
      <input
        ref={ref}
        {...props}
        className={["rounded-md border px-3 py-2", props.className].filter(Boolean).join(" ")}
      />
    );
  }
);



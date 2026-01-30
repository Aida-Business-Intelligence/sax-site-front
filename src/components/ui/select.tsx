import React from "react";

type SelectProps = {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
};

export function Select({
  value,
  onValueChange,
  disabled,
  children,
  className,
}: SelectProps) {
  // Extract SelectItem options from children
  const options: { value: string; label: React.ReactNode }[] = [];
  React.Children.forEach(children as any, (child: any) => {
    if (!child) return;
    if (child.type?.displayName === "SelectContent") {
      React.Children.forEach(child.props.children, (grand: any) => {
        if (grand?.type?.displayName === "SelectItem") {
          options.push({ value: String(grand.props.value), label: grand.props.children });
        }
      });
    }
  });
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onValueChange?.(e.target.value)}
      disabled={disabled}
      className={["rounded-md border px-3 py-2", className].filter(Boolean).join(" ")}
    >
      {/* Render a blank option to allow placeholder display in UI around it */}
      {!value ? <option value="" /> : null}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export const SelectTrigger: React.FC<React.PropsWithChildren<{ className?: string; disabled?: boolean }>> =
  function SelectTrigger({ children, className }) {
    return <div className={className}>{children}</div>;
  };
SelectTrigger.displayName = "SelectTrigger";

export const SelectValue: React.FC<{ placeholder?: string }> = function SelectValue() {
  return null;
};
SelectValue.displayName = "SelectValue";

export const SelectContent: React.FC<React.PropsWithChildren> = function SelectContent({ children }) {
  return <>{children}</>;
};
SelectContent.displayName = "SelectContent";

export const SelectItem: React.FC<React.PropsWithChildren<{ value: string }>> = function SelectItem({
  children,
}) {
  return <>{children}</>;
};
SelectItem.displayName = "SelectItem";



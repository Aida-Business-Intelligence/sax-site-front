import React, { useEffect, useMemo, useRef, useState } from "react";

type SelectProps = {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
  menuClassName?: string;
  placeholderClassName?: string;
};

export function Select({ value, onValueChange, disabled, children, className, menuClassName, placeholderClassName }: SelectProps) {
  // Extract options and placeholder from children structure
  const { options, placeholder } = useMemo(() => {
    const opts: { value: string; label: React.ReactNode }[] = [];
    let ph: string | undefined;
    const scan = (nodes: any) => {
      React.Children.forEach(nodes as any, (child: any) => {
        if (!child) return;
        const typeName = child.type?.displayName;
        if (typeName === "SelectContent") {
          scan(child.props.children);
        } else if (typeName === "SelectItem") {
          opts.push({ value: String(child.props.value), label: child.props.children });
        } else if (typeName === "SelectTrigger") {
          scan(child.props.children);
        } else if (typeName === "SelectValue") {
          ph = child.props?.placeholder ?? ph;
        } else if (child.props?.children) {
          scan(child.props.children);
        }
      });
    };
    scan(children);
    return { options: opts, placeholder: ph };
  }, [children]);

  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (e.target instanceof Node && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={wrapperRef} className={["relative", className].filter(Boolean).join(" ")}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-md px-0 py-0 text-left outline-none"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={["block w-full truncate", !selected ? (placeholderClassName ?? "text-black/40") : ""].join(" ")}>
          {selected ? selected.label : placeholder ?? "Selecionar"}
        </span>
        <svg
          aria-hidden="true"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          className="ml-2 text-black/40"
        >
          <path fill="currentColor" d="M7 10l5 5 5-5z" />
        </svg>
      </button>

      {open ? (
        <div
          role="listbox"
          className={[
            "absolute z-50 mt-2 max-h-60 overflow-auto rounded-lg border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900",
            menuClassName ? menuClassName : "w-full",
          ].join(" ")}
        >
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <button
                type="button"
                key={opt.value}
                role="option"
                aria-selected={active}
                onClick={() => {
                  onValueChange?.(opt.value);
                  setOpen(false);
                }}
                className={[
                  "flex w-full items-center rounded-md px-3 py-2 text-left text-sm transition",
                  active
                    ? "bg-zinc-100 font-medium dark:bg-zinc-800"
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                ].join(" ")}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
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



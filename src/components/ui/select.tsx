 "use client";
import React, { useEffect, useRef, useState, ReactNode, ReactElement } from "react";
import { createPortal } from "react-dom";

type SelectProps = {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
  menuClassName?: string;
  placeholderClassName?: string;
  caretClassName?: string;
  valueClassName?: string;
};

export function Select({ value, onValueChange, disabled, children, className, menuClassName, placeholderClassName, caretClassName, valueClassName }: SelectProps) {
  // Extract options and placeholder from children structure (no memo to satisfy React Compiler lints)
  const extract = (nodes: ReactNode | undefined) => {
    const opts: { value: string; label: ReactNode }[] = [];
    let ph: string | undefined;
    const scan = (ns: ReactNode | undefined) => {
      React.Children.forEach(ns, (child) => {
        if (!child || !React.isValidElement(child)) return;
        const el = child as ReactElement;
        const typeName = (el.type as { displayName?: string })?.displayName;
        if (typeName === "SelectContent") {
          scan((el.props as { children?: ReactNode }).children);
        } else if (typeName === "SelectItem") {
          opts.push({
            value: String((el.props as { value: unknown }).value),
            label: (el.props as { children?: ReactNode }).children,
          });
        } else if (typeName === "SelectTrigger") {
          scan((el.props as { children?: ReactNode }).children);
        } else if (typeName === "SelectValue") {
          ph = (el.props as { placeholder?: string }).placeholder ?? ph;
        } else if ((el.props as { children?: ReactNode }).children) {
          scan((el.props as { children?: ReactNode }).children);
        }
      });
    };
    scan(nodes);
    return { options: opts, placeholder: ph };
  };
  const { options, placeholder } = extract(children);

  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuRect, setMenuRect] = useState<{ left: number; top: number; width: number } | null>(null);
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (e.target instanceof Node) {
        if (wrapperRef.current.contains(e.target)) return;
        if (menuRef.current && menuRef.current.contains(e.target)) return;
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Position the menu using a portal to avoid stacking-context/overflow issues
  useEffect(() => {
    function updatePosition() {
      if (!open || !wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      setMenuRect({ left: rect.left, top: rect.bottom + 8, width: rect.width });
    }
    if (open) {
      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
    }
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

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
        <span className={["block w-full truncate", !selected ? (placeholderClassName ?? "text-black/40") : (valueClassName ?? "")].join(" ")}>
          {selected ? selected.label : placeholder ?? "Selecionar"}
        </span>
        <svg
          aria-hidden="true"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          className={["ml-2", caretClassName ?? "text-black/40"].join(" ")}
        >
          <path fill="currentColor" d="M7 10l5 5 5-5z" />
        </svg>
      </button>

      {open && menuRect
        ? createPortal(
        <div
              ref={menuRef}
          role="listbox"
          className={[
                "z-9999 max-h-60 overflow-auto rounded-lg border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900",
                menuClassName ? menuClassName : "",
          ].join(" ")}
              style={{
                position: "fixed",
                left: `${menuRect.left}px`,
                top: `${menuRect.top}px`,
                width: menuClassName ? undefined : `${menuRect.width}px`,
              }}
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
            </div>,
            document.body
          )
        : null}
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



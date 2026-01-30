import React, { createContext, useContext } from "react";

type FormContextValue = {
  setValue?: (name: string, value: unknown) => void;
  getValues?: () => Record<string, unknown>;
};

const FormContext = createContext<FormContextValue>({});

export function Form(props: React.PropsWithChildren<Record<string, any>>) {
  const value: FormContextValue = {
    setValue: props.setValue,
    getValues: props.getValues,
  };
  return <FormContext.Provider value={value}>{props.children}</FormContext.Provider>;
}

export function FormItem(props: React.PropsWithChildren<{ className?: string }>) {
  return <div className={props.className}>{props.children}</div>;
}

export function FormControl(props: React.PropsWithChildren<{}>) {
  return <>{props.children}</>;
}

type FieldRenderArgs = { field: { value?: any; onChange: (v: any) => void } };
type FormFieldProps = {
  name: string;
  control?: unknown;
  render: (args: FieldRenderArgs) => React.ReactNode;
};

export function FormField({ name, render }: FormFieldProps) {
  const ctx = useContext(FormContext);
  const onChange = (v: any) => ctx.setValue?.(name, v);
  return <>{render({ field: { value: undefined, onChange } })}</>;
}



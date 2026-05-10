import {
  useEffect,
  useRef,
  useState,
} from "react";
import type {
  ChangeEvent,
  CompositionEvent,
  FocusEvent,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

type FormFieldProps = {
  label: string;
  hint?: string;
  children: ReactNode;
};

export function FormField({ label, hint, children }: FormFieldProps) {
  return (
    <label className="grid gap-2 text-sm text-slate-700">
      <span className="font-medium text-slate-900">{label}</span>
      {children}
      {hint ? <span className="text-xs leading-6 text-slate-500">{hint}</span> : null}
    </label>
  );
}

const normalizeFieldValue = (value: string | number | readonly string[] | undefined) => {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (typeof value === "number") {
    return String(value);
  }

  return value ?? "";
};

const forwardCommittedChange = <T extends HTMLInputElement | HTMLTextAreaElement>(
  element: T,
  onChange?: (event: ChangeEvent<T>) => void,
) => {
  if (!onChange) {
    return;
  }

  onChange({
    target: element,
    currentTarget: element,
  } as ChangeEvent<T>);
};

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const {
    className,
    onBlur,
    onChange,
    onCompositionEnd,
    onCompositionStart,
    value,
    ...rest
  } = props;
  const [localValue, setLocalValue] = useState(() => normalizeFieldValue(value));
  const composingRef = useRef(false);

  useEffect(() => {
    if (!composingRef.current) {
      setLocalValue(normalizeFieldValue(value));
    }
  }, [value]);

  return (
    <input
      {...rest}
      className={`rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 ${className ?? ""}`.trim()}
      onBlur={(event: FocusEvent<HTMLInputElement>) => {
        if (!composingRef.current && localValue !== normalizeFieldValue(value)) {
          forwardCommittedChange(event.currentTarget, onChange);
        }

        onBlur?.(event);
      }}
      onChange={(event: ChangeEvent<HTMLInputElement>) => {
        setLocalValue(event.target.value);

        if (!composingRef.current) {
          onChange?.(event);
        }
      }}
      onCompositionEnd={(event: CompositionEvent<HTMLInputElement>) => {
        composingRef.current = false;
        setLocalValue(event.currentTarget.value);
        onCompositionEnd?.(event);
        forwardCommittedChange(event.currentTarget, onChange);
      }}
      onCompositionStart={(event: CompositionEvent<HTMLInputElement>) => {
        composingRef.current = true;
        onCompositionStart?.(event);
      }}
      value={localValue}
    />
  );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const {
    className,
    onBlur,
    onChange,
    onCompositionEnd,
    onCompositionStart,
    value,
    ...rest
  } = props;
  const [localValue, setLocalValue] = useState(() => normalizeFieldValue(value));
  const composingRef = useRef(false);

  useEffect(() => {
    if (!composingRef.current) {
      setLocalValue(normalizeFieldValue(value));
    }
  }, [value]);

  return (
    <textarea
      {...rest}
      className={`min-h-28 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 ${className ?? ""}`.trim()}
      onBlur={(event: FocusEvent<HTMLTextAreaElement>) => {
        if (!composingRef.current && localValue !== normalizeFieldValue(value)) {
          forwardCommittedChange(event.currentTarget, onChange);
        }

        onBlur?.(event);
      }}
      onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
        setLocalValue(event.target.value);

        if (!composingRef.current) {
          onChange?.(event);
        }
      }}
      onCompositionEnd={(event: CompositionEvent<HTMLTextAreaElement>) => {
        composingRef.current = false;
        setLocalValue(event.currentTarget.value);
        onCompositionEnd?.(event);
        forwardCommittedChange(event.currentTarget, onChange);
      }}
      onCompositionStart={(event: CompositionEvent<HTMLTextAreaElement>) => {
        composingRef.current = true;
        onCompositionStart?.(event);
      }}
      value={localValue}
    />
  );
}
import type { ReactNode } from "react";

/**
 * Studio-side primitives.
 *
 * Wireframe on purpose: native controls, hairline borders, no layout art. The brief
 * says this side can be dense and efficient, and right now the job is to prove the
 * flows work, not to style them. The client-facing hub is where the design effort
 * belongs.
 */

export function Panel({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="border-t border-rule pt-6 pb-10">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 className="text-h2 font-medium">{title}</h2>
        {actions}
      </div>
      {description ? (
        <p className="measure mt-2 text-small text-graphite">{description}</p>
      ) : null}
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function Field({
  label,
  name,
  hint,
  children,
}: {
  label: string;
  name: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-small">
        {label}
      </label>
      {hint ? <p className="mt-0.5 text-small text-graphite">{hint}</p> : null}
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

const inputClass =
  "block w-full border border-rule bg-sheet px-3 py-2 text-body text-ink";

export function TextInput({
  name,
  defaultValue,
  placeholder,
  type = "text",
  required,
  maxLength,
  pattern,
  autoComplete,
  step,
}: {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  maxLength?: number;
  pattern?: string;
  autoComplete?: string;
  /**
   * A number input defaults to step="1", which makes a line height of 1.6 invalid
   * and blocks the whole form with no visible reason. Anything fractional must
   * pass step="any".
   */
  step?: string;
}) {
  return (
    <input
      id={name}
      name={name}
      type={type}
      defaultValue={defaultValue}
      placeholder={placeholder}
      required={required}
      maxLength={maxLength}
      pattern={pattern}
      autoComplete={autoComplete}
      step={type === "number" ? (step ?? "any") : step}
      className={inputClass}
    />
  );
}

export function TextArea({
  name,
  defaultValue,
  rows = 3,
  placeholder,
  required,
}: {
  name: string;
  defaultValue?: string;
  rows?: number;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <textarea
      id={name}
      name={name}
      rows={rows}
      defaultValue={defaultValue}
      placeholder={placeholder}
      required={required}
      className={inputClass}
    />
  );
}

export function Select({
  name,
  options,
  defaultValue,
}: {
  name: string;
  options: readonly { value: string; label: string }[];
  defaultValue?: string;
}) {
  return (
    <select id={name} name={name} defaultValue={defaultValue} className={inputClass}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function Button({
  children,
  variant = "primary",
  type = "submit",
  name,
  value,
  formAction,
  disabled,
}: {
  children: ReactNode;
  variant?: "primary" | "quiet" | "danger";
  type?: "submit" | "button";
  name?: string;
  value?: string;
  formAction?: (formData: FormData) => void | Promise<void>;
  disabled?: boolean;
}) {
  const styles = {
    primary: "bg-ink text-paper",
    quiet: "border border-rule text-ink",
    danger: "border border-alert text-alert",
  }[variant];

  return (
    <button
      type={type}
      name={name}
      value={value}
      formAction={formAction}
      disabled={disabled}
      className={`cursor-pointer px-4 py-2 text-small disabled:cursor-default disabled:opacity-50 ${styles}`}
    >
      {children}
    </button>
  );
}

/** One editable row in a list of children (a color, a rule, an asset). */
export function Row({ children }: { children: ReactNode }) {
  return <div className="border-t border-rule py-5 first:border-t-0">{children}</div>;
}

export function Note({ children }: { children: ReactNode }) {
  return <p className="measure text-small text-graphite">{children}</p>;
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="measure text-small text-alert">
      {children}
    </p>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="measure border border-dashed border-rule px-4 py-6 text-small text-graphite">
      {children}
    </p>
  );
}

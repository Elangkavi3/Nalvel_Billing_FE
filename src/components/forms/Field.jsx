export function Field({
  label,
  value,
  onChange = () => {},
  type = 'text',
  required = false,
  readOnly = false,
  ...inputProps
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        autoComplete="off"
        readOnly={readOnly}
        className={readOnly ? 'readonly' : undefined}
        onChange={(event) => onChange(event.target.value)}
        {...inputProps}
      />
    </label>
  );
}

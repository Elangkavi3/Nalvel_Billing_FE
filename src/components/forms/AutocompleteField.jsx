export function AutocompleteField({
  label,
  value,
  onChange,
  required = false,
  readOnly = false,
  inputMode,
  maxLength,
  pattern,
  title,
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type="text"
        value={value}
        required={required}
        autoComplete="off"
        inputMode={inputMode}
        maxLength={maxLength}
        pattern={pattern}
        title={title}
        readOnly={readOnly}
        className={readOnly ? 'readonly' : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

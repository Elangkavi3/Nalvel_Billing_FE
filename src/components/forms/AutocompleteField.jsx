export function AutocompleteField({ label, value, onChange, required = false, inputMode, maxLength, pattern, title }) {
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
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

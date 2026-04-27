export function AutocompleteField({ label, value, onChange, required = false }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type="text"
        value={value}
        required={required}
        autoComplete="off"
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export function SelectField({ label, value, options, onChange, required = false, disabled = false }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select
        value={value}
        required={required}
        disabled={disabled}
        className={disabled ? 'readonly' : undefined}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="" disabled>
          Select {label}
        </option>
        {options.map((option) => (
          <option key={typeof option === 'string' ? option : option.value} value={typeof option === 'string' ? option : option.value}>
            {typeof option === 'string' ? option : option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

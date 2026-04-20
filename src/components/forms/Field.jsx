export function Field({ label, value, onChange, type = 'text', required = false }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type={type} value={value} required={required} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

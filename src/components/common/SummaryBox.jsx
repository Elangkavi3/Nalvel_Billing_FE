export function SummaryBox({ label, value, highlight = false }) {
  return (
    <div className={highlight ? 'summary-box highlight' : 'summary-box'}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

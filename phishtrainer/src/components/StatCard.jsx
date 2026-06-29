function StatCard({ label, value, tone }) {
  return (
    <div className={`stat-card ${tone ? `is-${tone}` : ''}`}>
      <p className="stat-value">{value}</p>
      <p className="stat-label">{label}</p>
    </div>
  );
}

export default StatCard;

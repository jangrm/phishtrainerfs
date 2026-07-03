function StatCard({ label, value, tone }) {
    return (
        <div className={`stat-card ${tone ? `is-${tone}` : ''}`}>
            <div className="stat-card-content">
                <p className="stat-value">{value}</p>
                <p className="stat-label">{label}</p>
            </div>
        </div>
    );
}

export default StatCard;
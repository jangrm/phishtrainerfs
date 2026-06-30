function formatHistoryDate(value) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function HistoryEntry({ item }) {
  const difficultyClass = `is-${item.difficulty.toLowerCase()}`;
  const resultClass = `is-${item.result.toLowerCase()}`;

  return (
    <article className={`history-item ${resultClass}`}>
      <span
        aria-label={item.result}
        className={`history-status-icon ${resultClass}`}
      />

      <div className="history-main">
        <p className="history-title">{item.title}</p>
        <p className="history-meta">
          <span className={`difficulty-chip ${difficultyClass}`}>
            {item.difficulty}
          </span>
          <span>
            {item.flagsFound}/{item.totalFlags} flags
          </span>
          <span>{formatHistoryDate(item.date)}</span>
        </p>
      </div>

      <div className="history-result">
        <span className={`result-badge ${resultClass}`}>
          {item.result}
        </span>
        <p className="xp">+{item.xp} XP</p>
      </div>
    </article>
  );
}

export default HistoryEntry;



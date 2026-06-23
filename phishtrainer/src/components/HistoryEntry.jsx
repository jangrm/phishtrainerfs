function formatHistoryDate(value) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function HistoryEntry({ item }) {
  const isCorrect = item.result === 'Correct';

  return (
    <div className="history-item">
      <span className={`history-status-icon ${isCorrect ? 'is-correct' : 'is-missed'}`}>
        {isCorrect ? '✓' : ''}
      </span>

      <div className="history-main">
        <p className="history-title">{item.title}</p>
        <p className="history-meta">
          {item.difficulty} · {item.flagsFound}/{item.totalFlags} flags ·{' '}
          {formatHistoryDate(item.date)}
        </p>
      </div>

      <div className="history-result">
        <span className={`result-badge ${isCorrect ? 'is-correct' : 'is-missed'}`}>
          {item.result}
        </span>
        <p className="xp">+{item.xp} XP</p>
      </div>
    </div>
  );
}

export default HistoryEntry;

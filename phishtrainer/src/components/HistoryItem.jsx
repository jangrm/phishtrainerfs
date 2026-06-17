function HistoryItem({ title, difficulty, flagsFound, totalFlags, result, xp }) {
  return (
    <div className="history-item">
      <div className="history-main">
        <p className="history-title">{title}</p>
        <p className="history-meta">{difficulty} · {flagsFound}/{totalFlags} flags</p>
      </div>
      <div className="history-result">
        <span className={`badge ${result === 'Correct' ? 'badge-ok' : 'badge-fail'}`}>{result}</span>
        <p className="xp">+{xp} XP</p>
      </div>
    </div>
  );
}

export default HistoryItem;
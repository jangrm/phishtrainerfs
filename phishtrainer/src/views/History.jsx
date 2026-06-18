import HistoryItem from '../components/HistoryItem';

function History() {
  return (
    <div className="view history">
      <h1>History</h1>

      <div className="stats-row">
        <p>42 total done</p>
        <p>74% accuracy</p>
        <p>1240 total XP</p>
      </div>

      <div className="history-list">
        <HistoryItem
          title="PayPal verification email"
          difficulty="Medium"
          flagsFound={2}
          totalFlags={3}
          result="Correct"
          xp={80}
        />
        <HistoryItem
          title="IT support password reset"
          difficulty="Hard"
          flagsFound={1}
          totalFlags={4}
          result="Missed"
          xp={10}
        />
        <HistoryItem
          title="Amazon order confirmation"
          difficulty="Easy"
          flagsFound={3}
          totalFlags={3}
          result="Correct"
          xp={60}
        />
      </div>
    </div>
  );
}

export default History;
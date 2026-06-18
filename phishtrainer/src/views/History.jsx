import HistoryItem from '../components/HistoryItem';

function History() {
  return (
    <div className="view history">
      <h1>History</h1>

      <div className="history-list">
        <HistoryItem
          title="PayPal account limitation"
          difficulty="Medium"
          flagsFound={3}
          totalFlags={3}
          result="Correct"
          xp={80}
        />
        <HistoryItem
          title="Invoice attachment"
          difficulty="Hard"
          flagsFound={2}
          totalFlags={4}
          result="Incorrect"
          xp={30}
        />
      </div>
    </div>
  );
}

export default History;

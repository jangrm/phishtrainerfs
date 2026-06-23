import { useEffect, useMemo, useState } from 'react';
import HistoryEntry from '../components/HistoryEntry';
import StatCard from '../components/StatCard';
import { getJson } from '../services/api';

const filters = ['All', 'Correct', 'Missed', 'Hard'];

function calculateSummary(items) {
  const total = items.length;
  const correct = items.filter((item) => item.result === 'Correct').length;
  const totalXp = items.reduce((sum, item) => sum + item.xp, 0);
  const accuracy = total === 0 ? 0 : Math.round((correct / total) * 100);

  return { total, accuracy, totalXp };
}

function History() {
  const [historyItems, setHistoryItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await getJson('/history');
        setHistoryItems(data);
      } catch {
        setError(
          'History data could not be loaded. Start the JSON server with npm run api.',
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadHistory();
  }, []);

  const summary = useMemo(() => calculateSummary(historyItems), [historyItems]);

  const filteredItems = useMemo(() => {
    if (activeFilter === 'All') {
      return historyItems;
    }

    if (activeFilter === 'Hard') {
      return historyItems.filter((item) => item.difficulty === 'Hard');
    }

    return historyItems.filter((item) => item.result === activeFilter);
  }, [activeFilter, historyItems]);

  if (isLoading) {
    return (
      <div className="view history">
        <section className="empty-state">Loading training history...</section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="view history">
        <section className="empty-state">{error}</section>
      </div>
    );
  }

  return (
    <div className="view history">
      <div className="stats-row">
        <StatCard label="total done" value={summary.total} />
        <StatCard label="accuracy" value={`${summary.accuracy}%`} />
        <StatCard label="total XP" value={summary.totalXp} />
      </div>

      <section className="history-panel">
        <div className="filter-row" aria-label="History filters">
          {filters.map((filter) => (
            <button
              className={activeFilter === filter ? 'is-selected' : ''}
              key={filter}
              onClick={() => setActiveFilter(filter)}
              type="button"
            >
              {filter}
            </button>
          ))}
        </div>

        <h2>Sessions</h2>

        <div className="history-list">
          {filteredItems.map((item) => (
            <HistoryEntry item={item} key={item.id} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default History;

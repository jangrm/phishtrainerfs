import { useMemo, useState } from 'react';
import HistoryEntry from '../components/HistoryEntry';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import SelectableButtons from '../components/SelectableButtons';
import { useApiData } from '../hooks/useApiData';

const filters = ['All', 'Correct', 'Missed', 'Hard'];

function calculateSummary(items) {
  const total = items.length;
  const correct = items.filter((item) => item.result === 'Correct').length;
  const totalXp = items.reduce((sum, item) => sum + item.xp, 0);
  const accuracy = total === 0 ? 0 : Math.round((correct / total) * 100);

  return { total, accuracy, totalXp };
}

function History() {
  const { data: historyItems, isLoading, error } = useApiData(
    '/history',
    'History data could not be loaded. Start the JSON server with npm run api.',
  );
  const [activeFilter, setActiveFilter] = useState('All');

  const summary = useMemo(
    () => calculateSummary(historyItems ?? []),
    [historyItems],
  );

  const filteredItems = useMemo(() => {
    const items = historyItems ?? [];

    if (activeFilter === 'All') {
      return items;
    }

    if (activeFilter === 'Hard') {
      return items.filter((item) => item.difficulty === 'Hard');
    }

    return items.filter((item) => item.result === activeFilter);
  }, [activeFilter, historyItems]);

  if (isLoading) {
    return <EmptyState viewName="history" message="Loading training history..." />;
  }

  if (error) {
    return <EmptyState viewName="history" message={error} />;
  }

  return (
    <div className="view history">
      <div className="stats-row">
        <StatCard label="total done" value={summary.total} />
        <StatCard label="accuracy" value={`${summary.accuracy}%`} />
        <StatCard label="total XP" value={summary.totalXp} />
      </div>

      <section className="history-panel">
        <SelectableButtons
          className="filter-row"
          options={filters}
          selected={activeFilter}
          onSelect={setActiveFilter}
          ariaLabel="History filters"
        />

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

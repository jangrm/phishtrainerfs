import { useMemo, useState } from 'react';
import HistoryEntry from '../components/HistoryEntry';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import SelectableButtons from '../components/SelectableButtons';
import { useApiData } from '../hooks/useApiData';

function calculateSummary(items, config) {
  const total = items.length;
  const correct = items.filter(
    (item) => item[config.accuracyField] === config.accuracyMatch,
  ).length;
  const totalXp = items.reduce((sum, item) => sum + item.xp, 0);
  const accuracy = total === 0 ? 0 : Math.round((correct / total) * 100);

  return { total, correct, accuracy, totalXp };
}

function History() {
  const { data: historyItems, isLoading, error } = useApiData(
    '/history',
    'History data could not be loaded. Start the JSON server with npm run api.',
  );
  const { data: filters, isLoading: filtersLoading, error: filterError } = useApiData(
    '/historyFilters',
    'History filters could not be loaded. Start the JSON server with npm run api.',
  );
  const {
    data: difficultyFilters,
    isLoading: difficultyFiltersLoading,
    error: difficultyFilterError,
  } = useApiData(
    '/historyDifficultyFilters',
    'History difficulty filters could not be loaded. Start the JSON server with npm run api.',
  );
  const {
    data: summaryConfig,
    isLoading: summaryLoading,
    error: summaryError,
  } = useApiData(
    '/historySummary',
    'History summary data could not be loaded. Start the JSON server with npm run api.',
  );
  const [activeFilter, setActiveFilter] = useState('');
  const [activeDifficulty, setActiveDifficulty] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const items = useMemo(() => historyItems ?? [], [historyItems]);

  const summary = useMemo(
    () => (summaryConfig ? calculateSummary(items, summaryConfig) : {}),
    [items, summaryConfig],
  );

  const filteredItems = useMemo(() => {
    const selectedFilter =
      filters?.find((filter) => filter.value === activeFilter) ?? filters?.[0];
    const selectedDifficulty =
      difficultyFilters?.find((filter) => filter.value === activeDifficulty) ??
      difficultyFilters?.[0];

    const query = searchTerm.trim().toLowerCase();

    return items.filter((item) => {
      const matchesResult =
        !selectedFilter?.field ||
        item[selectedFilter.field] === selectedFilter.match;
      const matchesDifficulty =
        !selectedDifficulty?.field ||
        item[selectedDifficulty.field] === selectedDifficulty.match;
      const matchesSearch =
        !query || item.title.toLowerCase().includes(query);

      return matchesResult && matchesDifficulty && matchesSearch;
    });
  }, [activeDifficulty, activeFilter, difficultyFilters, filters, items, searchTerm]);

  if (isLoading || filtersLoading || difficultyFiltersLoading || summaryLoading) {
    return <EmptyState viewName="history" message="Loading training history..." />;
  }

  if (error || filterError || difficultyFilterError || summaryError) {
    return (
      <EmptyState
        viewName="history"
        message={error || filterError || difficultyFilterError || summaryError}
      />
    );
  }

  return (
    <main className="view history">
      <section className="history-hero">
        <div className="history-hero-icon" aria-hidden="true">
          {summaryConfig.icon}
        </div>
        <div>
          <h1>{summaryConfig.title}</h1>
          <p>{summaryConfig.description}</p>
        </div>
      </section>

      <div className="stats-row">
        {summaryConfig.stats.map((stat) => (
          <StatCard
            key={stat.id}
            label={stat.label}
            tone={stat.tone}
            value={`${summary[stat.id]}${stat.suffix ?? ''}`}
          />
        ))}
      </div>

      <section className="history-panel">
        <div className="history-panel-header">
          <div>
            <h2>Sessions</h2>
            <p>
              {filteredItems.length} of {items.length} shown
            </p>
          </div>
        </div>

        <div className="history-controls">
          <form className="history-search" onSubmit={(event) => event.preventDefault()}>
            <label className="history-search-label" htmlFor="history-search-input">
              Search sessions
            </label>
            <input
              className="history-search-input"
              id="history-search-input"
              type="search"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </form>

          <SelectableButtons
            className="filter-row result-filter-row"
            options={filters ?? []}
            selected={activeFilter || filters?.[0]?.value}
            onSelect={setActiveFilter}
            ariaLabel="History filters"
          />

          <SelectableButtons
            className="filter-row difficulty-filter-row"
            options={difficultyFilters}
            selected={activeDifficulty || difficultyFilters?.[0]?.value}
            onSelect={setActiveDifficulty}
            ariaLabel="History difficulty filters"
          />
        </div>

        <div className="history-list">
          {filteredItems.length ? (
            filteredItems.map((item) => (
              <HistoryEntry item={item} key={item.id} />
            ))
          ) : (
            <p className="history-no-results">No sessions match your search.</p>
          )}
        </div>
      </section>
    </main>
  );
}

export default History;

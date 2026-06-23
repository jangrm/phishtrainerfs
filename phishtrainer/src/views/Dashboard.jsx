import { Link } from 'react-router-dom';
import { useState } from 'react';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import SelectableButtons from '../components/SelectableButtons';
import { useApiData } from '../hooks/useApiData';

function Dashboard() {
  const { data: dashboard, isLoading, error } = useApiData(
    '/dashboard',
    'Dashboard data could not be loaded. Start the JSON server with npm run api.',
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  if (isLoading) {
    return <EmptyState viewName="dashboard" message="Loading training data..." />;
  }

  if (error || !dashboard) {
    return <EmptyState viewName="dashboard" message={error} />;
  }

  const xpPercent = Math.round(
    (dashboard.xpCurrentLevel / dashboard.xpNextLevel) * 100,
  );
  const effectiveDifficulty = selectedDifficulty || dashboard.recommendedDifficulty;

  return (
    <div className="view dashboard">
      <section className="dashboard-hero" aria-label="Training progress">
        <div
          className="accuracy-meter"
          aria-label={`${dashboard.accuracy}% accuracy`}
          style={{ '--accuracy': `${dashboard.accuracy}%` }}
        >
          <div className="accuracy-meter-inner">
            <strong>{dashboard.accuracy}%</strong>
            <span>Accuracy</span>
          </div>
        </div>

        <div className="level-panel">
          <div className="level-heading">
            <span className="level-pill">
              Level {dashboard.level} - {dashboard.role}
            </span>
          </div>
          <h1>{dashboard.totalXp} XP total</h1>
          <div className="progress-label">
            <span>XP to next level</span>
            <span>
              {dashboard.xpCurrentLevel}/{dashboard.xpNextLevel}
            </span>
          </div>
          <div className="progress-track" aria-label={`${xpPercent}% XP progress`}>
            <div className="progress-fill" style={{ width: `${xpPercent}%` }} />
          </div>
        </div>
      </section>

      <div className="stats-row">
        <StatCard label="scenarios done" value={dashboard.scenariosDone} />
        <StatCard label="correct" value={dashboard.correct} />
        <StatCard label="missed" value={dashboard.missed} />
      </div>

      <section className="dashboard-section">
        <h2>10-Day Streak</h2>
        <div className="streak-row" aria-label="10 day streak">
          {dashboard.streak.map((active, index) => (
            <span
              className={`streak-dot ${active ? 'is-active' : ''}`}
              key={`streak-${index}`}
              title={`Day ${index + 1}`}
            >
              {active ? (
                <span className="streak-check">✓</span>
              ) : (
                <span className="streak-day">{index + 1}</span>
              )}
            </span>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <h2>Badges</h2>
        <div className="badge-row">
          {dashboard.badges.map((badge) => (
            <span
              className={`badge-dot ${badge.earned ? 'is-earned' : ''}`}
              key={badge.id}
              title={badge.label}
            />
          ))}
        </div>
      </section>

      <section className="difficulty-panel">
        <h2>Difficulty</h2>
        <SelectableButtons
          className="difficulty-row"
          options={dashboard.difficulties}
          selected={effectiveDifficulty}
          onSelect={setSelectedDifficulty}
          ariaLabel="Difficulty selection"
        />

        <Link
          className="primary-btn"
          to={`/scenario?difficulty=${effectiveDifficulty.toLowerCase()}`}
        >
          Start training -&gt;
        </Link>
      </section>
    </div>
  );
}

export default Dashboard;

import { Link } from 'react-router-dom';
import { useState } from 'react';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import SelectableButtons from '../components/SelectableButtons';
import { useApiData } from '../hooks/useApiData';
import { patchJson } from '../services/api';

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
  const savedDifficulty =
    selectedDifficulty || dashboard.selectedDifficulty || dashboard.recommendedDifficulty;
  const streakDays = dashboard.streak.map((entry, index) => {
    if (typeof entry === 'boolean') {
      return { day: index + 1, completed: entry, current: false };
    }

    return entry;
  });
  const activeStreakDays = streakDays.filter((day) => day.completed).length;
  const earnedBadges = dashboard.badges.filter((badge) => badge.earned);
  const xpRemaining = dashboard.xpNextLevel - dashboard.xpCurrentLevel;

  async function handleDifficultySelect(difficulty) {
    setSelectedDifficulty(difficulty);

    try {
      await patchJson('/dashboard', { selectedDifficulty: difficulty });
    } catch {
      setSelectedDifficulty('');
    }
  }

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

          <div className="dashboard-highlights" aria-label="Dashboard highlights">
            <span>{xpRemaining} XP to level up</span>
            <span>{activeStreakDays} day streak</span>
            <span>{earnedBadges.length} badges earned</span>
          </div>
        </div>
      </section>

      <div className="stats-row">
        <StatCard label="scenarios done" value={dashboard.scenariosDone} tone="primary" />
        <StatCard label="correct" value={dashboard.correct} tone="success" />
        <StatCard label="missed" value={dashboard.missed} tone="danger" />
      </div>

      <section className="dashboard-section">
        <div className="dashboard-section-header">
          <div>
            <h2>
              <span className="heading-symbol" aria-hidden="true">
                {dashboard.streakIcon}
              </span>
              {activeStreakDays}-Day Streak
            </h2>
          </div>
          <span className="section-tag is-gold">
            {dashboard.streakBadgeIcon} {dashboard.streakBadge}
          </span>
        </div>
        <div className="streak-row" aria-label={`${activeStreakDays} day streak`}>
          {streakDays.map((day) => (
            <span
              className={`streak-dot ${day.completed ? 'is-active' : ''} ${day.current ? 'is-current' : ''}`}
              key={`streak-${day.day}`}
              title={`Day ${day.day}`}
            >
              {day.completed ? (
                <span className="streak-check" aria-hidden="true" />
              ) : (
                <span className="streak-day">{day.day}</span>
              )}
            </span>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section-header">
          <div>
            <h2>
              <span className="heading-symbol" aria-hidden="true">
                {dashboard.badgeSectionIcon}
              </span>
              Badges
            </h2>
          </div>
          <span className="section-tag is-purple">
            {earnedBadges.length} / {dashboard.badges.length} earned
          </span>
        </div>
        <div className="badge-row">
          {dashboard.badges.map((badge) => (
            <div
              className={`badge-card badge-${badge.id} ${badge.earned ? 'is-earned' : ''}`}
              key={badge.id}
              title={badge.label}
              style={{ '--badge-color': badge.color }}
            >
              <span className="badge-dot" aria-hidden="true">
                <span className="badge-icon">{badge.icon}</span>
              </span>
              <span className="badge-label">{badge.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="difficulty-panel">
        <h2>Difficulty</h2>
        <SelectableButtons
          className="difficulty-row"
          options={dashboard.difficulties}
          selected={savedDifficulty}
          onSelect={handleDifficultySelect}
          ariaLabel="Difficulty selection"
        />

        <Link
          className="primary-btn"
          to={`/scenario?difficulty=${savedDifficulty.toLowerCase()}`}
        >
          Start training
        </Link>
      </section>
    </div>
  );
}

export default Dashboard;

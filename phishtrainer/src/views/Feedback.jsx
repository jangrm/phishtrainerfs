import { Link, useSearchParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import ResultBanner from '../components/ResultBanner';
import StatCard from '../components/StatCard';
import { useApiData } from '../hooks/useApiData';

function parseSelectedFlags(value) {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item));
}

function calculateXp(scenario, correct, flagsFound, totalFlags) {
  const baseXp = scenario.xp ?? 60;

  if (!scenario.isPhishing) {
    return correct ? baseXp : 0;
  }

  const flagRatio = totalFlags === 0 ? 1 : flagsFound / totalFlags;

  if (correct) {
    return Math.round(baseXp * (0.6 + flagRatio * 0.4));
  }

  return Math.round(baseXp * flagRatio * 0.2);
}

function Feedback() {
  const [searchParams] = useSearchParams();
  const {
    data: scenarios,
    isLoading: scenariosLoading,
    error: scenariosError,
  } = useApiData('/scenarios', 'Could not load scenarios.');
  const {
    data: dashboard,
    isLoading: dashboardLoading,
    error: dashboardError,
  } = useApiData('/dashboard', 'Could not load dashboard data.');

  if (scenariosLoading || dashboardLoading) {
    return <EmptyState message="Loading feedback..." />;
  }

  if (scenariosError || dashboardError || !scenarios?.length || !dashboard) {
    return (
      <EmptyState
        message={
          scenariosError ||
          dashboardError ||
          'No feedback data available.'
        }
      />
    );
  }

  const scenarioId = searchParams.get('scenarioId');
  const decision = searchParams.get('decision');
  const selectedFlags = parseSelectedFlags(searchParams.get('flags'));
  const difficulty = searchParams.get('difficulty');
  const isLastScenario = searchParams.get('isLastScenario') === 'true';
  const nextScenarioId = searchParams.get('nextScenarioId');
  const scenario = scenarios.find((item) => item.id === scenarioId);

  if (!scenario || !decision) {
    return <EmptyState message="Feedback could not be calculated." />;
  }

  const scenarioSet = scenarios.filter((item) => item.difficulty === difficulty);
  const visibleScenarios = scenarioSet.length ? scenarioSet : scenarios;
  const scenarioIndex =
    visibleScenarios.findIndex((item) => item.id === scenario.id) + 1;
  const scenarioTotal = visibleScenarios.length;
  const expectedDecision = scenario.isPhishing ? 'phishing' : 'legitimate';
  const correct = decision === expectedDecision;
  const totalFlags = scenario.redFlags?.length ?? 0;
  const uniqueSelectedFlags = [...new Set(selectedFlags)];
  const flagsFound = uniqueSelectedFlags.filter(
    (index) => index >= 0 && index < totalFlags,
  ).length;
  const xpEarned = calculateXp(scenario, correct, flagsFound, totalFlags);
  const xpCurrent = dashboard.xpCurrentLevel + xpEarned;
  const progress = Math.min(
    100,
    Math.round((xpCurrent / dashboard.xpNextLevel) * 100),
  );
  const nextScenarioPath = isLastScenario
    ? '/'
    : `/scenario?difficulty=${scenario.difficulty}&scenarioId=${nextScenarioId || scenario.id}`;
  const message = correct
    ? `Correct - that was ${scenario.isPhishing ? 'phishing' : 'legitimate'}!`
    : `Missed - that was ${scenario.isPhishing ? 'phishing' : 'legitimate'}.`;
  const subMessage = totalFlags
    ? `You identified ${flagsFound} of ${totalFlags} red flags`
    : 'No red flags were expected in this message';
  const explainedFlags = totalFlags
    ? scenario.redFlags.map((flag, index) => ({
        label: flag.text,
        detail: flag.explanation,
        status: uniqueSelectedFlags.includes(index) ? 'found' : 'missed',
      }))
    : [
        {
          label: 'Legitimate message',
          detail: 'This email uses a consistent sender, ordinary wording, and no suspicious links or requests.',
          status: correct ? 'found' : 'missed',
        },
      ];

  return (
    <main className="feedback-page">
      <ResultBanner
        correct={correct}
        message={message}
        subMessage={subMessage}
        scenario={`Scenario ${scenarioIndex}/${scenarioTotal}`}
      />

      <div className="feedback-stats">
        <StatCard value={`+${xpEarned}`} label="XP earned" />
        <StatCard value={`${flagsFound}/${totalFlags}`} label="flags found" />
        <StatCard value={`${dashboard.accuracy}%`} label="accuracy" />
      </div>

      <section className="feedback-card red-flags-card">
        <h2>Red Flags Explained</h2>

        <ul>
          {explainedFlags.map((flag) => (
            <li key={flag.label}>
              <span className={`flag-dot ${flag.status === 'found' ? 'is-found' : 'is-missed'}`} />
              <p>
                <strong>{flag.label}</strong>
                <span> ({flag.detail})</span>
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="feedback-card xp-card">
        <p className="xp-earned">+{xpEarned} XP earned</p>
        <p className="xp-progress-text">
          {xpCurrent} / {dashboard.xpNextLevel} XP to Level {dashboard.level + 1}
        </p>

        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </section>

      <div className="feedback-actions">
        <Link to="/history" className="feedback-secondary-btn">
          View history
        </Link>

        <Link to={nextScenarioPath} className="feedback-primary-btn">
          {isLastScenario ? 'To dashboard' : 'Next scenario ->'}
        </Link>
      </div>
    </main>
  );
}

export default Feedback;

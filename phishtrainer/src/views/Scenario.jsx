import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import EmailCard from '../components/EmailCard';
import EmptyState from '../components/EmptyState';
import { useApiData } from '../hooks/useApiData';

function formatScenarioDate(value) {
  return new Intl.DateTimeFormat('en', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function getScenarioByDifficulty(scenarios, difficulty) {
  if (!difficulty) {
    return scenarios[0];
  }

  return (
    scenarios.find((scenario) => scenario.difficulty === difficulty) ??
    scenarios[0]
  );
}

function Scenario() {
  const [searchParams] = useSearchParams();
  const [decision, setDecision] = useState('');
  const { data: scenarios, isLoading, error } = useApiData(
    '/scenarios',
    'Scenario data could not be loaded. Start the JSON server with npm run api.',
  );

  if (isLoading) {
    return <EmptyState viewName="scenario" message="Loading scenario..." />;
  }

  if (error || !scenarios?.length) {
    return (
      <EmptyState
        viewName="scenario"
        message={error || 'No scenario data available.'}
      />
    );
  }

  const selectedDifficulty = searchParams.get('difficulty');
  const scenario = getScenarioByDifficulty(scenarios, selectedDifficulty);
  const scenarioIndex = scenarios.findIndex((item) => item.id === scenario.id) + 1;
  const scenarioTotal = scenarios.length;
  const progress = Math.round((scenarioIndex / scenarioTotal) * 100);
  const difficultyLabel =
    scenario.difficulty.charAt(0).toUpperCase() + scenario.difficulty.slice(1);
  const feedbackPath = `/feedback?scenarioId=${scenario.id}&decision=${decision}&difficulty=${scenario.difficulty}`;

  return (
    <main className="view scenario scenario-page">
      <section className="scenario-header">
        <div className="scenario-title-block">
          <span className="level-pill">{difficultyLabel}</span>
          <h1>
            Scenario {scenarioIndex} / {scenarioTotal}
          </h1>
        </div>

        <div className="scenario-progress">
          <div className="progress-label">
            <span>Training progress</span>
            <span>{progress}%</span>
          </div>
          <div className="progress-track" aria-label={`${progress}% training progress`}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </section>

      <EmailCard
        from={scenario.from}
        to={scenario.to}
        date={formatScenarioDate(scenario.date)}
        subject={scenario.subject}
        body={scenario.body}
      />

      <section className="scenario-decision-card">
        <h2>Your decision</h2>

        <div className="verdict-buttons" aria-label="Scenario decision">
          <button
            className={decision === 'phishing' ? 'is-selected' : ''}
            onClick={() => setDecision('phishing')}
            type="button"
          >
            Phishing
          </button>
          <button
            className={decision === 'legitimate' ? 'is-selected' : ''}
            onClick={() => setDecision('legitimate')}
            type="button"
          >
            Legitimate
          </button>
        </div>

        <Link
          className={`primary-btn ${!decision ? 'is-disabled' : ''}`}
          to={feedbackPath}
          aria-disabled={!decision}
          onClick={(event) => {
            if (!decision) {
              event.preventDefault();
            }
          }}
        >
          Submit decision
        </Link>
      </section>
    </main>
  );
}

export default Scenario;

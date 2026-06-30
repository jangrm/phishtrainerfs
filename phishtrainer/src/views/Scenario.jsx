import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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

function getScenarioSet(scenarios, difficulty) {
  if (!difficulty) {
    return scenarios;
  }

  const matchingScenarios = scenarios.filter(
    (scenario) => scenario.difficulty === difficulty,
  );

  return matchingScenarios.length ? matchingScenarios : scenarios;
}

function getScenario(scenarios, scenarioId) {
  if (!scenarioId) {
    return scenarios[0];
  }

  return scenarios.find((scenario) => scenario.id === scenarioId) ?? scenarios[0];
}

function renderFlaggableText(value, redFlags, selectedFlags, onToggleFlag) {
  const matches = redFlags
    .map((flag, index) => ({
      flag,
      index,
      position: value.indexOf(flag.text),
    }))
    .filter((match) => match.position >= 0)
    .sort((first, second) => first.position - second.position);

  if (!matches.length) {
    return value;
  }

  const parts = [];
  let cursor = 0;

  matches.forEach(({ flag, index, position }) => {
    if (position < cursor) {
      return;
    }

    const isSelected = selectedFlags.includes(index);

    if (position > cursor) {
      parts.push(value.slice(cursor, position));
    }

    parts.push(
      <button
        aria-pressed={isSelected}
        className={`flag-token ${isSelected ? 'is-selected' : ''}`}
        key={`${flag.text}-${position}`}
        onClick={() => onToggleFlag(index)}
        type="button"
      >
        {flag.text}
      </button>,
    );

    cursor = position + flag.text.length;
  });

  if (cursor < value.length) {
    parts.push(value.slice(cursor));
  }

  return parts;
}

function ScenarioTraining({ scenario, scenarioIndex, scenarioSet }) {
  const [decision, setDecision] = useState('');
  const [selectedFlags, setSelectedFlags] = useState([]);
  const scenarioTotal = scenarioSet.length;
  const progress = Math.round((scenarioIndex / scenarioTotal) * 100);
  const difficultyLabel =
    scenario.difficulty.charAt(0).toUpperCase() + scenario.difficulty.slice(1);
  const redFlags = scenario.redFlags ?? [];
  const isLastScenario = scenarioIndex === scenarioTotal;
  const nextScenario = scenarioSet[scenarioIndex] ?? scenarioSet[0];
  const feedbackParams = new URLSearchParams({
    decision,
    difficulty: scenario.difficulty,
    flags: selectedFlags.join(','),
    isLastScenario: String(isLastScenario),
    nextScenarioId: nextScenario.id,
    scenarioId: scenario.id,
  });
  const feedbackPath = `/feedback?${feedbackParams.toString()}`;

  function handleToggleFlag(flagIndex) {
    setSelectedFlags((currentFlags) =>
      currentFlags.includes(flagIndex)
        ? currentFlags.filter((item) => item !== flagIndex)
        : [...currentFlags, flagIndex],
    );
  }

  const renderText = (value) =>
    renderFlaggableText(value, redFlags, selectedFlags, handleToggleFlag);

  return (
    <main className="view scenario scenario-page">
      <section className="scenario-header">
        <div className="scenario-title-block">
          <span className="level-pill">{difficultyLabel}</span>
          <h1>
            Scenario {scenarioIndex} / {scenarioTotal}
          </h1>
          <div className="scenario-meta">
            <span>{scenario.category}</span>
            <span>{scenario.xp} XP available</span>
          </div>
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

      <div className="scenario-workspace">
        <section className="email-card">
          <div className="email-toolbar">
            <span />
            <span />
            <span />
          </div>
          <div className="email-header">
            <p><strong>From:</strong> {scenario.senderName} &lt;{renderText(scenario.from)}&gt;</p>
            <p><strong>To:</strong> {scenario.to}</p>
            <p><strong>Date:</strong> {formatScenarioDate(scenario.date)}</p>
          </div>
          <h2 className="email-subject">{renderText(scenario.subject)}</h2>
          <p className="email-body">{renderText(scenario.body)}</p>
        </section>

        <section className="scenario-decision-card">
          <div className="scenario-panel-header">
            <div>
              <h2>Suspicious signals</h2>
              <p>{selectedFlags.length} selected</p>
            </div>
          </div>

          <div className="selected-signal-list" aria-label="Selected suspicious signals">
            {selectedFlags.length ? (
              selectedFlags.map((flagIndex) => (
                <button
                  key={redFlags[flagIndex].text}
                  onClick={() => handleToggleFlag(flagIndex)}
                  type="button"
                >
                  {redFlags[flagIndex].text}
                </button>
              ))
            ) : (
              <p>No suspicious signals selected.</p>
            )}
          </div>

          <div className="scenario-panel-header decision-heading">
            <div>
              <h2>Your decision</h2>
              <p>Choose the final verdict for this email.</p>
            </div>
          </div>

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
      </div>
    </main>
  );
}

function Scenario() {
  const [searchParams] = useSearchParams();
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
  const selectedScenarioId = searchParams.get('scenarioId');
  const scenarioSet = getScenarioSet(scenarios, selectedDifficulty);
  const scenario = getScenario(scenarioSet, selectedScenarioId);
  const scenarioIndex =
    scenarioSet.findIndex((item) => item.id === scenario.id) + 1;

  return (
    <ScenarioTraining
      key={`${scenario.difficulty}-${scenario.id}`}
      scenario={scenario}
      scenarioIndex={scenarioIndex}
      scenarioSet={scenarioSet}
    />
  );
}

export default Scenario;

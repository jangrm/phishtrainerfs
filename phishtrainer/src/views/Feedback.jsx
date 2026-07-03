import { useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import ResultBanner from '../components/ResultBanner';
import StatCard from '../components/StatCard';
import { useApiData } from '../hooks/useApiData';
import { patchJson, postJson } from '../services/api';

function parseSelectedFlags(value) {
    if (!value) return [];

    return value
        .split(',')
        .map((item) => Number(item))
        .filter((item) => Number.isInteger(item));
}

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

function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function calculateXp(scenario, correct, flagsFound, totalFlags) {
    const maxXp = scenario.xp ?? 0;

    if (!scenario.isPhishing) {
        return correct ? maxXp : 0;
    }

    const verdictXp = correct ? Math.round(maxXp * 0.6) : 0;
    const flagXp =
        totalFlags > 0 ? Math.round(maxXp * 0.4 * (flagsFound / totalFlags)) : 0;

    return Math.min(maxXp, verdictXp + flagXp);
}

function renderReviewedText(value, redFlags, selectedFlags) {
    const matches = redFlags
        .map((flag, index) => ({
            flag,
            index,
            position: value.indexOf(flag.text),
        }))
        .filter((match) => match.position >= 0)
        .sort((a, b) => a.position - b.position);

    if (!matches.length) return value;

    const parts = [];
    let cursor = 0;

    matches.forEach(({ flag, index, position }) => {
        if (position < cursor) return;

        if (position > cursor) {
            parts.push(value.slice(cursor, position));
        }

        const found = selectedFlags.includes(index);

        parts.push(
            <span
                key={`${flag.text}-${position}`}
                className={`feedback-token ${found ? 'is-found' : 'is-missed'}`}
            >
        {flag.text}
      </span>,
        );

        cursor = position + flag.text.length;
    });

    if (cursor < value.length) {
        parts.push(value.slice(cursor));
    }

    return parts;
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

    const recordedSearchRef = useRef('');

    useEffect(() => {
        const search = searchParams.toString();
        if (recordedSearchRef.current === search) return;
        if (scenariosLoading || dashboardLoading) return;
        if (!scenarios?.length || !dashboard) return;

        const scenarioId = searchParams.get('scenarioId');
        const decision = searchParams.get('decision');
        const scenario = scenarios.find((item) => item.id === scenarioId);
        if (!scenario || !decision) return;

        recordedSearchRef.current = search;

        const selectedFlags = [...new Set(parseSelectedFlags(searchParams.get('flags')))];
        const redFlags = scenario.redFlags ?? [];
        const totalFlags = redFlags.length;
        const flagsFound = selectedFlags.filter(
            (index) => index >= 0 && index < totalFlags,
        ).length;
        const expectedDecision = scenario.isPhishing ? 'phishing' : 'legitimate';
        const correct = decision === expectedDecision;
        const xpEarned = calculateXp(scenario, correct, flagsFound, totalFlags);

        const scenariosDone = dashboard.scenariosDone + 1;
        const correctCount = dashboard.correct + (correct ? 1 : 0);
        const missedCount = dashboard.missed + (correct ? 0 : 1);
        let level = dashboard.level;
        let xpCurrentLevel = dashboard.xpCurrentLevel + xpEarned;
        if (xpCurrentLevel >= dashboard.xpNextLevel) {
            level += 1;
            xpCurrentLevel -= dashboard.xpNextLevel;
        }

        async function recordResult() {
            await postJson('/history', {
                title: scenario.title,
                difficulty: capitalize(scenario.difficulty),
                flagsFound,
                totalFlags,
                result: correct ? 'Correct' : 'Missed',
                xp: xpEarned,
                date: new Date().toISOString(),
            });

            await patchJson('/dashboard', {
                scenariosDone,
                correct: correctCount,
                missed: missedCount,
                totalXp: dashboard.totalXp + xpEarned,
                level,
                xpCurrentLevel,
                accuracy: Math.round((correctCount / scenariosDone) * 100),
            });
        }

        recordResult().catch(() => {
            recordedSearchRef.current = '';
        });
    }, [dashboard, dashboardLoading, scenarios, scenariosLoading, searchParams]);

    if (scenariosLoading || dashboardLoading) {
        return <EmptyState message="Loading feedback..." />;
    }

    if (scenariosError || dashboardError || !scenarios?.length || !dashboard) {
        return (
            <EmptyState
                message={scenariosError || dashboardError || 'No feedback data available.'}
            />
        );
    }

    const scenarioId = searchParams.get('scenarioId');
    const decision = searchParams.get('decision');
    const difficulty = searchParams.get('difficulty');
    const selectedFlags = [...new Set(parseSelectedFlags(searchParams.get('flags')))];
    const isLastScenario = searchParams.get('isLastScenario') === 'true';
    const nextScenarioId = searchParams.get('nextScenarioId');

    const scenario = scenarios.find((item) => item.id === scenarioId);

    if (!scenario || !decision) {
        return <EmptyState message="Feedback could not be calculated." />;
    }

    const redFlags = scenario.redFlags ?? [];
    const totalFlags = redFlags.length;
    const flagsFound = selectedFlags.filter(
        (index) => index >= 0 && index < totalFlags,
    ).length;

    const scenarioSet = scenarios.filter((item) => item.difficulty === difficulty);
    const visibleScenarios = scenarioSet.length ? scenarioSet : scenarios;
    const scenarioIndex =
        visibleScenarios.findIndex((item) => item.id === scenario.id) + 1;
    const scenarioTotal = visibleScenarios.length;

    const expectedDecision = scenario.isPhishing ? 'phishing' : 'legitimate';
    const correct = decision === expectedDecision;
    const xpEarned = calculateXp(scenario, correct, flagsFound, totalFlags);
    const xpCurrent = dashboard.xpCurrentLevel + xpEarned;
    const xpRemaining = Math.max(0, dashboard.xpNextLevel - xpCurrent);
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
        ? redFlags.map((flag, index) => ({
            label: flag.text,
            detail: flag.explanation,
            status: selectedFlags.includes(index) ? 'found' : 'missed',
        }))
        : [
            {
                label: 'Legitimate message',
                detail:
                    'This email uses a consistent sender, ordinary wording, and no suspicious links or requests.',
                status: correct ? 'found' : 'missed',
            },
        ];

    const renderText = (value) => renderReviewedText(value, redFlags, selectedFlags);

    return (
        <main className="feedback-page">
            <ResultBanner
                correct={correct}
                message={message}
                subMessage={subMessage}
                scenario={`Scenario ${scenarioIndex}/${scenarioTotal}`}
            />

            <div className="feedback-stats feedback-stats-polished">
                <StatCard value={`+${xpEarned}`} label="XP earned" tone="primary" />
                <StatCard value={`${flagsFound}/${totalFlags}`} label="flags found" tone="success" />
                <StatCard value={`${dashboard.accuracy}%`} label="accuracy" tone="gold" />
            </div>

            <section className="feedback-card feedback-decision-card">
                <div className="decision-left">
                    <h2>Your Decision</h2>
                    <p>
                        Your verdict:{' '}
                        <strong className={correct ? 'is-primary-text' : 'is-danger-text'}>
                            {decision}
                        </strong>
                    </p>
                    <p>
                        Correct answer: <strong className="is-success-text">{expectedDecision}</strong>
                    </p>
                </div>

                <div className="decision-xp">
                    <span>Max XP for this scenario</span>
                    <strong>{scenario.xp} XP</strong>
                </div>
            </section>

            <section className="feedback-card reviewed-email-card">
                <div className="feedback-section-heading">
                    <h2>Reviewed Email</h2>

                    <div className="feedback-legend">
            <span>
              <i className="legend-found" /> Found
            </span>
                        <span>
              <i className="legend-missed" /> Missed
            </span>
                    </div>
                </div>

                <div className="feedback-email">
                    <p>
                        <strong>From:</strong> {scenario.senderName} &lt;{renderText(scenario.from)}&gt;
                    </p>
                    <p>
                        <strong>To:</strong> {scenario.to}
                    </p>
                    <p>
                        <strong>Date:</strong> {formatScenarioDate(scenario.date)}
                    </p>

                    <hr />

                    <h3>{renderText(scenario.subject)}</h3>
                    <p>{renderText(scenario.body)}</p>
                </div>
            </section>

            <section className="feedback-card red-flags-card polished-red-flags">
                <h2>Red Flags Explained</h2>

                <ul>
                    {explainedFlags.map((flag) => (
                        <li
                            key={flag.label}
                            className={flag.status === 'found' ? 'is-found-row' : 'is-missed-row'}
                        >
              <span
                  className={`flag-status-icon ${
                      flag.status === 'found' ? 'is-found' : 'is-missed'
                  }`}
              >
                {flag.status === 'found' ? '✓' : '×'}
              </span>

                            <strong>{flag.label}</strong>
                            <span>{flag.detail}</span>

                            <em>{flag.status === 'found' ? 'Found' : 'Missed'}</em>
                        </li>
                    ))}
                </ul>
            </section>

            <section className="feedback-card xp-card polished-xp-card">
                <div>
                    <p className="xp-earned">+{xpEarned} XP earned</p>
                    <p className="xp-progress-text">
                        {xpCurrent} / {dashboard.xpNextLevel} XP to Level {dashboard.level + 1}
                    </p>
                </div>

                <span>{xpRemaining} XP until Level {dashboard.level + 1}</span>

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
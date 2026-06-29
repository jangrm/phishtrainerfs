import { Link, useSearchParams } from 'react-router-dom';
import ResultBanner from '../components/ResultBanner';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import { useApiData } from '../hooks/useApiData';

function Feedback() {
    const [searchParams] = useSearchParams();
    const { data: feedback, isLoading, error } = useApiData(
        '/feedback',
        'Could not load feedback data.'
    );

    const { data: scenarios } = useApiData(
        '/scenarios',
        'Could not load scenarios.'
    );

    if (isLoading) {
        return <EmptyState message="Loading feedback..." />;
    }

    if (error || !feedback) {
        return <EmptyState message={error || 'No feedback data available.'} />;
    }

    const progress = (feedback.xpCurrent / feedback.xpToNextLevel) * 100;
    const scenarioId = Number(searchParams.get('scenarioId'));
    const scenarioIndex = scenarios?.findIndex((scenario) => scenario.id === scenarioId) + 1 || 1;
    const scenarioTotal = scenarios?.length ?? 1;

    return (
        <main className="feedback-page">
            <ResultBanner
                correct={feedback.correct}
                message={feedback.message}
                subMessage={`You identified ${feedback.flagsFound} of ${feedback.totalFlags} red flags`}
                scenario={`Scenario ${scenarioIndex}/${scenarioTotal}`}
            />

            <div className="feedback-stats">
                <StatCard value={`+${feedback.xpEarned}`} label="XP earned" />
                <StatCard value={`${feedback.flagsFound}/${feedback.totalFlags}`} label="flags found" />
                <StatCard value={`${feedback.accuracy}%`} label="accuracy" />
            </div>

            <section className="feedback-card red-flags-card">
                <h2>Red Flags Explained</h2>

                <ul>
                    {feedback.redFlags.map((flag) => (
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
                <p className="xp-earned">+{feedback.xpEarned} XP earned</p>
                <p className="xp-progress-text">
                    {feedback.xpCurrent} / {feedback.xpToNextLevel} XP to Level {feedback.level}
                </p>

                <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
            </section>

            <div className="feedback-actions">
                <Link to="/history" className="feedback-secondary-btn">
                    View history
                </Link>

                <Link to="/scenario" className="feedback-primary-btn">
                    Next scenario →
                </Link>
            </div>
        </main>
    );
}

export default Feedback;

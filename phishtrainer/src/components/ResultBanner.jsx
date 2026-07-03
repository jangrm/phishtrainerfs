function ResultBanner({ correct, message, subMessage, scenario }) {
    return (
        <section className="feedback-result-card">
            <div className="feedback-result-content">
                <div className={`feedback-result-icon ${correct ? 'is-correct' : 'is-missed'}`}>
                    {correct ? '✓' : '×'}
                </div>

                <div>
                    <p className="feedback-result-title">{message}</p>
                    <p className="feedback-result-subtitle">{subMessage}</p>
                </div>
            </div>

            <span className="feedback-scenario-badge">{scenario}</span>
        </section>
    );
}

export default ResultBanner;
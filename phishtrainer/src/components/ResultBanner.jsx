function ResultBanner({ correct, message }) {
  return (
    <div className={`result-banner ${correct ? 'correct' : 'incorrect'}`}>
      <p>{message}</p>
    </div>
  );
}

export default ResultBanner;
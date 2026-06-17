import { Link } from 'react-router-dom';
import ResultBanner from '../components/ResultBanner';

function Feedback() {
  return (
    <div className="view feedback">
      <h1>Feedback</h1>

      <ResultBanner correct={true} message="Correct — that was phishing!" />

      <div className="red-flags">
        <h2>Red flags explained</h2>
        <ul>
          <li>Suspicious sender domain — not the real PayPal address.</li>
          <li>Malicious link — leads to a fake login page.</li>
          <li>Urgency language — creates panic to rush your decision.</li>
        </ul>
      </div>

      <p className="xp-earned">+80 XP earned</p>

      <div className="feedback-actions">
        <Link to="/history"><button>View history</button></Link>
        <Link to="/scenario"><button className="primary-btn">Next scenario</button></Link>
      </div>
    </div>
  );
}

export default Feedback;
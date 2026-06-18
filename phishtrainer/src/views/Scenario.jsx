import { Link } from 'react-router-dom';
import EmailCard from '../components/EmailCard';

function Scenario() {
  return (
    <div className="view scenario">
      <h1>Scenario 3 / 10</h1>

      <EmailCard
        from="support@paypa1-secure.com"
        to="you@example.com"
        date="Thu, 5 Jun 2026, 09:14"
        subject="Urgent: Your account has been limited"
        body="Dear valued customer, we have detected unusual activity on your PayPal account. Please verify your identity within 24 hours."
      />

      <div className="verdict-buttons">
        <button>Phishing</button>
        <button>Legitimate</button>
      </div>

      <Link to="/feedback">
        <button className="primary-btn">Submit decision</button>
      </Link>
    </div>
  );
}

export default Scenario;

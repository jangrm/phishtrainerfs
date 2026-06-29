import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav>
      <span className="brand">
        <span className="brand-icon" aria-hidden="true">🛡️</span>
        PhishTrainer
      </span>
      <div className="nav-links">
        <Link to="/">Dashboard</Link>
        <Link to="/history">History</Link>
      </div>
    </nav>
  );
}

export default Navbar;

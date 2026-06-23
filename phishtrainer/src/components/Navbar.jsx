import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav>
      <span className="brand">PhishTrainer</span>
      <div className="nav-links">
        <Link to="/">Dashboard</Link>
        <Link to="/history">History</Link>
      </div>
    </nav>
  );
}

export default Navbar;

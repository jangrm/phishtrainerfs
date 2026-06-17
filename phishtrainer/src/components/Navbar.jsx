import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav>
      <Link to="/">Dashboard</Link>
      <Link to="/history">History</Link>
      <Link to="/feedback">Feedback</Link>
      <Link to="/scenario">Scenario</Link>
    </nav>
  );
}

export default Navbar;
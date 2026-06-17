import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';

function Dashboard() {
  return (
    <div className="view dashboard">
      <h1>Dashboard</h1>

      <div className="stats-row">
        <StatCard label="Total XP" value="1240" />
        <StatCard label="Accuracy" value="74%" />
        <StatCard label="Streak" value="7 days" />
      </div>

      <div className="difficulty-row">
        <button>Easy</button>
        <button>Medium</button>
        <button>Hard</button>
      </div>

      <Link to="/scenario">
        <button className="primary-btn">Start training</button>
      </Link>
    </div>
  );
}

export default Dashboard;
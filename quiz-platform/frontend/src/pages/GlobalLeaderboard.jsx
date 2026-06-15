import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const GlobalLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    api
      .get('/leaderboard/global')
      .then((res) => setLeaderboard(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load leaderboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container center">Loading leaderboard...</div>;

  return (
    <div className="container" style={{ maxWidth: 640 }}>
      <h2>Global Leaderboard</h2>
      {error && <div className="error-text">{error}</div>}
      <div className="card">
        {leaderboard.length === 0 ? (
          <p className="muted">No data yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Total Score</th>
                <th>Quizzes Taken</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry) => (
                <tr key={entry.userId} style={user && entry.userId === user.id ? { background: '#eef2ff' } : {}}>
                  <td className={entry.rank <= 3 ? `rank-${entry.rank}` : ''}>#{entry.rank}</td>
                  <td>{entry.name}</td>
                  <td>{entry.totalScore}</td>
                  <td>{entry.quizzesTaken}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default GlobalLeaderboard;

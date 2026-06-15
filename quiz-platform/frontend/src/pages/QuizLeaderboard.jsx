import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

const QuizLeaderboard = () => {
  const { id } = useParams();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/quizzes/${id}/leaderboard`)
      .then((res) => setLeaderboard(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load leaderboard'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container center">Loading leaderboard...</div>;

  return (
    <div className="container" style={{ maxWidth: 640 }}>
      <div className="flex-between">
        <h2>Leaderboard</h2>
        <Link className="btn secondary" to="/">Back to Quizzes</Link>
      </div>
      {error && <div className="error-text">{error}</div>}
      <div className="card">
        {leaderboard.length === 0 ? (
          <p className="muted">No attempts yet. Be the first!</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Score</th>
                <th>Correct</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry) => (
                <tr key={entry.rank}>
                  <td className={entry.rank <= 3 ? `rank-${entry.rank}` : ''}>#{entry.rank}</td>
                  <td>{entry.user?.name || 'Unknown'}</td>
                  <td>{entry.score} / {entry.totalPossible}</td>
                  <td>{entry.correctCount} / {entry.totalQuestions}</td>
                  <td>{entry.timeTakenSeconds}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default QuizLeaderboard;

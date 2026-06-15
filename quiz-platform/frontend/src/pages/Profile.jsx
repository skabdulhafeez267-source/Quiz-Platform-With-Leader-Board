import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/leaderboard/me')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container center">Loading profile...</div>;

  return (
    <div className="container" style={{ maxWidth: 640 }}>
      <h2>My Profile</h2>
      <div className="card">
        <p><strong>Name:</strong> {user?.name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Total Score:</strong> {data?.totalScore}</p>
        <p><strong>Quizzes Taken:</strong> {data?.quizzesTaken}</p>
      </div>

      <h3>Quiz History</h3>
      {error && <div className="error-text">{error}</div>}
      {data?.history?.length === 0 ? (
        <p className="muted">You haven't attempted any quizzes yet.</p>
      ) : (
        data?.history?.map((h) => (
          <div className="card" key={h.resultId}>
            <div className="flex-between">
              <div>
                <strong>{h.quiz?.title || 'Deleted Quiz'}</strong>
                <p className="muted" style={{ margin: '4px 0' }}>{h.quiz?.category}</p>
              </div>
              <div className="center">
                <div>{h.score} / {h.totalPossible}</div>
                <div className="muted">{h.correctCount}/{h.totalQuestions} correct</div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Profile;

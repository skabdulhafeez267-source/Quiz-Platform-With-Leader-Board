import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/quizzes')
      .then((res) => setQuizzes(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load quizzes'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container center">Loading quizzes...</div>;

  return (
    <div className="container">
      <h2>Available Quizzes</h2>
      {error && <div className="error-text">{error}</div>}
      {quizzes.length === 0 && !error && <p className="muted">No quizzes available yet.</p>}
      <div className="grid">
        {quizzes.map((quiz) => (
          <div className="card" key={quiz._id}>
            <div className="flex-between">
              <h3 style={{ margin: 0 }}>{quiz.title}</h3>
              <span className="badge">{quiz.difficulty}</span>
            </div>
            <p className="muted">{quiz.description}</p>
            <p className="muted">
              {quiz.totalQuestions} questions • {quiz.totalPoints} points • {quiz.durationMinutes} min
            </p>
            <div className="flex-between">
              <Link className="btn" to={`/quiz/${quiz._id}`}>Start Quiz</Link>
              <Link className="btn secondary" to={`/leaderboard/${quiz._id}`}>Leaderboard</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizList;

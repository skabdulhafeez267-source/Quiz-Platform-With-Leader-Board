import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const QuizAttempt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selections, setSelections] = useState({}); // questionId -> optionIndex
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/quizzes/${id}`)
      .then((res) => {
        setQuiz(res.data);
        setTimeLeft(res.data.durationMinutes * 60);
        setStartTime(Date.now());
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load quiz'));
  }, [id]);

  const handleSubmit = useCallback(async () => {
    if (!quiz || submitting) return;
    setSubmitting(true);
    const timeTakenSeconds = Math.round((Date.now() - startTime) / 1000);
    const answers = quiz.questions.map((q) => ({
      questionId: q._id,
      selectedOptionIndex: selections[q._id] !== undefined ? selections[q._id] : -1,
    }));

    try {
      const res = await api.post(`/quizzes/${id}/submit`, { answers, timeTakenSeconds });
      navigate(`/result/${id}`, { state: { result: res.data, quiz, selections } });
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
      setSubmitting(false);
    }
  }, [quiz, selections, startTime, id, navigate, submitting]);

  useEffect(() => {
    if (!quiz) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, quiz, handleSubmit]);

  if (error) return <div className="container error-text">{error}</div>;
  if (!quiz) return <div className="container center">Loading quiz...</div>;

  const question = quiz.questions[currentIndex];
  const progress = ((currentIndex + 1) / quiz.questions.length) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const selectOption = (optionIndex) => {
    setSelections((prev) => ({ ...prev, [question._id]: optionIndex }));
  };

  return (
    <div className="container" style={{ maxWidth: 640 }}>
      <div className="flex-between">
        <h2>{quiz.title}</h2>
        <span className="timer">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="card">
        <p className="muted">
          Question {currentIndex + 1} of {quiz.questions.length} • {question.points} points
        </p>
        <h3>{question.questionText}</h3>
        {question.options.map((opt, idx) => (
          <div
            key={opt._id}
            className={`option-row ${selections[question._id] === idx ? 'selected' : ''}`}
            onClick={() => selectOption(idx)}
          >
            <input
              type="radio"
              checked={selections[question._id] === idx}
              onChange={() => selectOption(idx)}
            />
            <span>{opt.text}</span>
          </div>
        ))}

        <div className="flex-between" style={{ marginTop: 20 }}>
          <button
            className="btn secondary"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((i) => i - 1)}
          >
            Previous
          </button>

          {currentIndex < quiz.questions.length - 1 ? (
            <button className="btn" onClick={() => setCurrentIndex((i) => i + 1)}>
              Next
            </button>
          ) : (
            <button className="btn" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizAttempt;

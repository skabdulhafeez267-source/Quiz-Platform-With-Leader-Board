import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';

const QuizResult = () => {
  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();

  if (!state || !state.result) {
    return (
      <div className="container center">
        <p>No result data found.</p>
        <Link className="btn" to="/">Back to Quizzes</Link>
      </div>
    );
  }

  const { result, quiz, selections } = state;
  const percent = Math.round((result.score / result.totalPossible) * 100);
  const correctMap = {};
  result.correctAnswers.forEach((c) => {
    correctMap[c.questionId] = c.correctOptionIndex;
  });

  return (
    <div className="container" style={{ maxWidth: 640 }}>
      <h2>Quiz Result</h2>
      <div className="card center">
        <h1 style={{ margin: '8px 0' }}>{percent}%</h1>
        <p className="muted">
          {result.correctCount} / {result.totalQuestions} correct • Score: {result.score} / {result.totalPossible}
        </p>
        <div className="flex-between" style={{ justifyContent: 'center', gap: 12, marginTop: 14 }}>
          <button className="btn" onClick={() => navigate(`/leaderboard/${id}`)}>View Leaderboard</button>
          <Link className="btn secondary" to="/">Back to Quizzes</Link>
        </div>
      </div>

      <h3>Review</h3>
      {quiz.questions.map((q) => {
        const selected = selections[q._id];
        const correctIdx = correctMap[q._id];
        return (
          <div className="card" key={q._id}>
            <p style={{ fontWeight: 600 }}>{q.questionText}</p>
            {q.options.map((opt, idx) => {
              let cls = 'option-row';
              if (idx === correctIdx) cls += ' correct';
              else if (idx === selected) cls += ' incorrect';
              return (
                <div key={opt._id} className={cls}>
                  <span>{opt.text}</span>
                  {idx === correctIdx && <span className="muted"> (Correct answer)</span>}
                  {idx === selected && idx !== correctIdx && <span className="muted"> (Your answer)</span>}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default QuizResult;

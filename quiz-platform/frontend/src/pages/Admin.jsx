import { useEffect, useState } from 'react';
import api from '../api/axios';

const emptyQuestion = () => ({
  questionText: '',
  options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
  correctOptionIndex: 0,
  points: 10,
});

const Admin = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [difficulty, setDifficulty] = useState('medium');
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadQuizzes = () => {
    api.get('/quizzes').then((res) => setQuizzes(res.data)).catch(() => {});
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  const updateQuestion = (idx, field, value) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const updateOption = (qIdx, oIdx, value) => {
    setQuestions((prev) => {
      const next = [...prev];
      const opts = [...next[qIdx].options];
      opts[oIdx] = { text: value };
      next[qIdx] = { ...next[qIdx], options: opts };
      return next;
    });
  };

  const addQuestion = () => setQuestions((prev) => [...prev, emptyQuestion()]);
  const removeQuestion = (idx) => setQuestions((prev) => prev.filter((_, i) => i !== idx));

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    for (const q of questions) {
      if (!q.questionText.trim() || q.options.some((o) => !o.text.trim())) {
        setError('All questions and options must be filled in');
        return;
      }
    }

    setSaving(true);
    try {
      await api.post('/quizzes', {
        title,
        description,
        category,
        difficulty,
        durationMinutes: Number(durationMinutes),
        questions,
      });
      setMessage('Quiz created successfully');
      setTitle('');
      setDescription('');
      setCategory('General');
      setDifficulty('medium');
      setDurationMinutes(10);
      setQuestions([emptyQuestion()]);
      loadQuizzes();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create quiz');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this quiz?')) return;
    try {
      await api.delete(`/quizzes/${id}`);
      loadQuizzes();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete quiz');
    }
  };

  return (
    <div className="container">
      <h2>Admin: Manage Quizzes</h2>

      <h3>Create New Quiz</h3>
      <div className="card">
        <form onSubmit={handleCreateQuiz}>
          <div className="form-group">
            <label>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>
          <div className="grid">
            <div className="form-group">
              <label>Category</label>
              <input value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Difficulty</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="form-group">
              <label>Duration (minutes)</label>
              <input type="number" min={1} value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} />
            </div>
          </div>

          <h4>Questions</h4>
          {questions.map((q, qIdx) => (
            <div className="card" key={qIdx} style={{ background: '#fafafa' }}>
              <div className="flex-between">
                <label>Question {qIdx + 1}</label>
                {questions.length > 1 && (
                  <button type="button" className="btn danger" onClick={() => removeQuestion(qIdx)}>
                    Remove
                  </button>
                )}
              </div>
              <div className="form-group">
                <input
                  placeholder="Question text"
                  value={q.questionText}
                  onChange={(e) => updateQuestion(qIdx, 'questionText', e.target.value)}
                />
              </div>
              {q.options.map((opt, oIdx) => (
                <div className="form-group" key={oIdx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    type="radio"
                    name={`correct-${qIdx}`}
                    checked={q.correctOptionIndex === oIdx}
                    onChange={() => updateQuestion(qIdx, 'correctOptionIndex', oIdx)}
                  />
                  <input
                    placeholder={`Option ${oIdx + 1}`}
                    value={opt.text}
                    onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                    style={{ flex: 1 }}
                  />
                </div>
              ))}
              <div className="form-group" style={{ maxWidth: 120 }}>
                <label>Points</label>
                <input
                  type="number"
                  min={1}
                  value={q.points}
                  onChange={(e) => updateQuestion(qIdx, 'points', Number(e.target.value))}
                />
              </div>
            </div>
          ))}

          <button type="button" className="btn secondary" onClick={addQuestion}>
            + Add Question
          </button>

          {error && <div className="error-text">{error}</div>}
          {message && <p style={{ color: 'var(--success)' }}>{message}</p>}

          <div style={{ marginTop: 16 }}>
            <button className="btn" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Create Quiz'}
            </button>
          </div>
        </form>
      </div>

      <h3>Existing Quizzes</h3>
      <div className="grid">
        {quizzes.map((quiz) => (
          <div className="card" key={quiz._id}>
            <h4 style={{ margin: 0 }}>{quiz.title}</h4>
            <p className="muted">{quiz.totalQuestions} questions • {quiz.category}</p>
            <button className="btn danger" onClick={() => handleDelete(quiz._id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Admin;

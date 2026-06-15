const express = require('express');
const Quiz = require('../models/Quiz');
const Result = require('../models/Result');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/quizzes - list all published quizzes (no answers exposed)
router.get('/', protect, async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({ isPublished: true })
      .select('title description category difficulty durationMinutes questions createdAt')
      .lean();

    const sanitized = quizzes.map((q) => ({
      _id: q._id,
      title: q.title,
      description: q.description,
      category: q.category,
      difficulty: q.difficulty,
      durationMinutes: q.durationMinutes,
      totalQuestions: q.questions.length,
      totalPoints: q.questions.reduce((s, x) => s + x.points, 0),
      createdAt: q.createdAt,
    }));

    res.json(sanitized);
  } catch (err) {
    next(err);
  }
});

// GET /api/quizzes/:id - get quiz for attempting (hide correct answers)
router.get('/:id', protect, async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id).lean();
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const sanitized = {
      _id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      category: quiz.category,
      difficulty: quiz.difficulty,
      durationMinutes: quiz.durationMinutes,
      questions: quiz.questions.map((q) => ({
        _id: q._id,
        questionText: q.questionText,
        options: q.options.map((o) => ({ _id: o._id, text: o.text })),
        points: q.points,
      })),
    };

    res.json(sanitized);
  } catch (err) {
    next(err);
  }
});

// POST /api/quizzes - create quiz (admin only)
router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const { title, description, category, difficulty, durationMinutes, questions } = req.body;

    if (!title || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Title and at least one question are required' });
    }

    for (const q of questions) {
      if (
        !q.questionText ||
        !Array.isArray(q.options) ||
        q.options.length < 2 ||
        typeof q.correctOptionIndex !== 'number' ||
        q.correctOptionIndex < 0 ||
        q.correctOptionIndex >= q.options.length
      ) {
        return res.status(400).json({ message: 'Each question needs text, options, and a valid correctOptionIndex' });
      }
    }

    const quiz = await Quiz.create({
      title,
      description,
      category,
      difficulty,
      durationMinutes,
      questions,
      createdBy: req.user._id,
    });

    res.status(201).json(quiz);
  } catch (err) {
    next(err);
  }
});

// PUT /api/quizzes/:id - update quiz (admin only)
router.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const updatable = ['title', 'description', 'category', 'difficulty', 'durationMinutes', 'questions', 'isPublished'];
    updatable.forEach((field) => {
      if (req.body[field] !== undefined) quiz[field] = req.body[field];
    });

    await quiz.save();
    res.json(quiz);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/quizzes/:id - delete quiz (admin only)
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    await quiz.deleteOne();
    await Result.deleteMany({ quiz: quiz._id });

    res.json({ message: 'Quiz deleted' });
  } catch (err) {
    next(err);
  }
});

// POST /api/quizzes/:id/submit - submit answers, calculate score
router.post('/:id/submit', protect, async (req, res, next) => {
  try {
    const { answers, timeTakenSeconds } = req.body; // answers: [{ questionId, selectedOptionIndex }]
    const quiz = await Quiz.findById(req.params.id).lean();
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    if (!Array.isArray(answers)) {
      return res.status(400).json({ message: 'answers must be an array' });
    }

    let score = 0;
    let correctCount = 0;
    const totalPossible = quiz.questions.reduce((s, q) => s + q.points, 0);

    const detailedAnswers = quiz.questions.map((q) => {
      const submitted = answers.find((a) => String(a.questionId) === String(q._id));
      const selectedOptionIndex = submitted ? submitted.selectedOptionIndex : -1;
      const isCorrect = selectedOptionIndex === q.correctOptionIndex;
      if (isCorrect) {
        score += q.points;
        correctCount += 1;
      }
      return {
        question: q._id,
        selectedOptionIndex,
        isCorrect,
      };
    });

    const result = await Result.create({
      user: req.user._id,
      quiz: quiz._id,
      score,
      totalPossible,
      correctCount,
      totalQuestions: quiz.questions.length,
      timeTakenSeconds: timeTakenSeconds || 0,
      answers: detailedAnswers,
    });

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalScore: score, quizzesTaken: 1 },
    });

    res.status(201).json({
      resultId: result._id,
      score,
      totalPossible,
      correctCount,
      totalQuestions: quiz.questions.length,
      correctAnswers: quiz.questions.map((q) => ({
        questionId: q._id,
        correctOptionIndex: q.correctOptionIndex,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/quizzes/:id/leaderboard - top scores for a quiz
router.get('/:id/leaderboard', protect, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;

    const topResults = await Result.find({ quiz: req.params.id })
      .sort({ score: -1, timeTakenSeconds: 1, createdAt: 1 })
      .limit(limit)
      .populate('user', 'name email')
      .lean();

    const leaderboard = topResults.map((r, idx) => ({
      rank: idx + 1,
      user: r.user ? { id: r.user._id, name: r.user.name } : null,
      score: r.score,
      totalPossible: r.totalPossible,
      correctCount: r.correctCount,
      totalQuestions: r.totalQuestions,
      timeTakenSeconds: r.timeTakenSeconds,
      createdAt: r.createdAt,
    }));

    res.json(leaderboard);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

const express = require('express');
const User = require('../models/User');
const Result = require('../models/Result');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/leaderboard/global - top users by total score
router.get('/global', protect, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;

    const topUsers = await User.find()
      .sort({ totalScore: -1, quizzesTaken: -1 })
      .limit(limit)
      .select('name totalScore quizzesTaken')
      .lean();

    const leaderboard = topUsers.map((u, idx) => ({
      rank: idx + 1,
      userId: u._id,
      name: u.name,
      totalScore: u.totalScore,
      quizzesTaken: u.quizzesTaken,
    }));

    res.json(leaderboard);
  } catch (err) {
    next(err);
  }
});

// GET /api/leaderboard/me - current user's history and stats
router.get('/me', protect, async (req, res, next) => {
  try {
    const results = await Result.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('quiz', 'title category')
      .lean();

    const history = results.map((r) => ({
      resultId: r._id,
      quiz: r.quiz ? { id: r.quiz._id, title: r.quiz.title, category: r.quiz.category } : null,
      score: r.score,
      totalPossible: r.totalPossible,
      correctCount: r.correctCount,
      totalQuestions: r.totalQuestions,
      timeTakenSeconds: r.timeTakenSeconds,
      createdAt: r.createdAt,
    }));

    res.json({
      totalScore: req.user.totalScore,
      quizzesTaken: req.user.quizzesTaken,
      history,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    score: { type: Number, required: true },
    totalPossible: { type: Number, required: true },
    correctCount: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    timeTakenSeconds: { type: Number, default: 0 },
    answers: [
      {
        question: { type: mongoose.Schema.Types.ObjectId },
        selectedOptionIndex: { type: Number },
        isCorrect: { type: Boolean },
      },
    ],
  },
  { timestamps: true }
);

resultSchema.index({ quiz: 1, score: -1 });
resultSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Result', resultSchema);
